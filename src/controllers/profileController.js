const path = require("path");
const db = require("../config/db");
const imageHelper = require("../helpers/imageHelper");
const dobHelper = require("../helpers/dobHelper");

// ✅ GET: Show edit profile
exports.showEditProfile = (req, res) => {
  const id = req.session.adminId;

  const sql = `
    SELECT admin.*, roles.name AS roleName
    FROM admin
    LEFT JOIN roles ON admin.roleId = roles.id
    WHERE admin.id = ?
  `;
  const getRolesSql = "SELECT * FROM roles";

  db.query(sql, [id], (err, result) => {
    if (err || result.length === 0) {
      return renderProfile({
        res,
        user: {},
        roles: [],
        error: "DB error or user not found",
      });
    }

    const user = result[0];
    const dobFormatted = dobHelper.formatDob(user.dob);
    const hobbyArray = user.hobby ? user.hobby.split(",") : [];

    db.query(getRolesSql, (roleErr, roleResults) => {
      if (roleErr) {
        return renderProfile({
          res,
          user,
          roles: [],
          dobFormatted,
          hobbyArray,
          error: "Error loading roles.",
        });
      }

      const successMessage = req.session.successMsg;
      req.session.successMsg = null;

      renderProfile({
        res,
        user,
        roles: roleResults,
        dobFormatted,
        hobbyArray,
        success: successMessage,
      });
    });
  });
};

// ✅ Helper to render profile page
function renderProfile({
  res,
  user = {},
  roles = [],
  dobFormatted = "",
  hobbyArray = [],
  error = null,
  success = null,
}) {
  res.render("editProfile", {
    name: user.name || "",
    email: user.email || "",
    username: user.username || "",
    address: user.address || "",
    dob: dobFormatted,
    gender: user.gender || "",
    phone: user.phone_no || "",
    hobby: hobbyArray,
    roleId: user.roleId || 0,
    roleName: user.roleName || "",
    roles,
    image: imageHelper.getImageUrl(user.image),
    error,
    success,
    csrfToken: res.locals._csrf || "",
    currentPage: "index",
    pageTitle: "User Profile",
    breadcrumbs: [{ label: "Home", url: "/" }, { label: "User Profile" }],
  });
}

// ✅ POST: Update profile
exports.updateProfile = (req, res) => {
  const { name, email, username, address, dob, gender, phone, roleId } =
    req.body;
  let { hobby } = req.body;
  const id = req.session.adminId;

  const getUserSql = `
    SELECT admin.*, roles.name AS roleName
    FROM admin
    LEFT JOIN roles ON admin.roleId = roles.id
    WHERE admin.id = ?
  `;
  const getRolesSql = "SELECT * FROM roles";

  db.query(getUserSql, [id], (err, result) => {
    if (err || result.length === 0) {
      return renderWithError("Failed to fetch existing user.", []);
    }

    const user = result[0];
    const currentImage = user.image || imageHelper.getDefaultImage();
    const newImage = req.file ? imageHelper.saveImage(req.file) : null;
    const imageToUse = newImage || currentImage;

    if (newImage && !imageHelper.isDefaultImage(currentImage)) {
      imageHelper.deleteImage(currentImage);
    }

    if (!hobby) hobby = [];
    else if (!Array.isArray(hobby)) hobby = [hobby];
    const hobbyString = hobby.join(",");

    const formattedDob = dob || null;

    const checkSql = `
      SELECT * FROM admin
      WHERE (username = ? OR email = ?) AND id != ?
    `;
    db.query(checkSql, [username, email, id], (err, checkResults) => {
      if (err) {
        return renderWithError("Database error while checking uniqueness.", []);
      }

      if (checkResults.length) {
        const existing = checkResults[0];
        const conflictMessage =
          existing.username === username
            ? "Username already exists."
            : "Email already exists.";
        return renderWithError(conflictMessage, []);
      }

      const updateSql = `
        UPDATE admin SET
          name = ?, email = ?, username = ?, image = ?, address = ?, dob = ?,
          gender = ?, phone_no = ?, hobby = ?, roleId = ?
        WHERE id = ?
      `;
      const values = [
        name,
        email,
        username,
        imageToUse,
        address,
        formattedDob,
        gender,
        phone,
        hobbyString,
        roleId || null,
        id,
      ];

      db.query(updateSql, values, (err) => {
        if (err) return renderWithError("Database update failed.", []);

        req.session.name = name;
        req.session.email = email;
        req.session.image = imageToUse;
        req.session.successMsg = "Profile updated successfully.";

        req.session.save((err) => {
          if (err) console.error("Session save error:", err);
          res.redirect("/editprofile");
        });
      });
    });

    function renderWithError(errorMessage, roleResults) {
      if (!roleResults.length) {
        db.query(getRolesSql, (roleErr, roles) => {
          if (roleErr) {
            console.error("Error fetching roles:", roleErr);
            return res.status(500).send("Error fetching roles.");
          }
          renderPage(errorMessage, roles);
        });
      } else {
        renderPage(errorMessage, roleResults);
      }
    }

    function renderPage(errorMessage, roles) {
      res.render("editProfile", {
        name,
        email,
        username,
        address,
        dob: dobHelper.formatDob(dob),
        gender,
        phone,
        hobby: Array.isArray(hobby) ? hobby : hobby ? [hobby] : [],
        roleId: roleId || user.roleId || 0,
        roleName: user.roleName || "",
        roles,
        image: imageHelper.getImageUrl(imageToUse),
        error: errorMessage,
        success: null,
        csrfToken: "",
        currentPage: "index",
        pageTitle: "User Profile",
        breadcrumbs: [{ label: "Home", url: "/" }, { label: "User Profile" }],
      });
    }
  });
};
