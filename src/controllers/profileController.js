const path = require("path");
const db = require("../config/db");
const fs = require("fs");

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

    const dobFormatted = user.dob
      ? (() => {
          const parsedDate = new Date(user.dob);
          if (!isNaN(parsedDate)) {
            return new Date(
              parsedDate.getTime() - parsedDate.getTimezoneOffset() * 60000
            )
              .toISOString()
              .split("T")[0];
          }
          return "";
        })()
      : "";

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

      // ✅ Keep success message before clearing
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

// ✅ Helper to render profile
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
    image: "/src/assets/image/uploads/" + (user.image || "profile-user.png"),
    error,
    success,
    csrfToken: res.locals._csrf || "",
    currentPage: "editprofile",
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
  const newImage = req.file ? req.file.filename : null;

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
    const currentImage = user.image || "profile-user.png";
    const imageToUse = newImage || currentImage;

    // ✅ Delete old image if needed
    if (newImage && currentImage !== "profile-user.png") {
      const oldImagePath = path.join(
        __dirname,
        "../assets/image/uploads",
        currentImage
      );
      if (fs.existsSync(oldImagePath)) {
        fs.unlink(oldImagePath, (unlinkErr) => {
          if (unlinkErr) {
            console.error("Error deleting old image:", unlinkErr);
          }
        });
      }
    }

    // ✅ Normalize hobbies
    if (!hobby) {
      hobby = [];
    } else if (!Array.isArray(hobby)) {
      hobby = [hobby];
    }
    const hobbyString = hobby.join(",");

    // ✅ Check for duplicate username/email
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

      // ✅ Update profile
      const updateSql = `
        UPDATE admin SET
          name = ?,
          email = ?,
          username = ?,
          image = ?,
          address = ?,
          dob = ?,
          gender = ?,
          phone_no = ?,
          hobby = ?,
          roleId = ?
        WHERE id = ?
      `;
      const values = [
        name,
        email,
        username,
        imageToUse,
        address,
        dob,
        gender,
        phone,
        hobbyString,
        roleId || null,
        id,
      ];

      db.query(updateSql, values, (err) => {
        if (err) {
          return renderWithError("Database update failed.", []);
        }

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

    // ✅ Helper to render form with error + roles
    function renderWithError(errorMessage, roleResults) {
      if (!roleResults || roleResults.length === 0) {
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

    // Helper to actually render
    function renderPage(errorMessage, roles) {
      res.render("editProfile", {
        name,
        email,
        username,
        address,
        dob,
        gender,
        phone,
        hobby: Array.isArray(hobby) ? hobby : hobby ? [hobby] : [],
        roleId: roleId || user.roleId || 0,
        roleName: user.roleName || "",
        roles,
        image: "/src/assets/image/uploads/" + imageToUse,
        error: errorMessage,
        success: null,
        csrfToken: req.csrfToken(),
        currentPage: "editprofile",
        pageTitle: "User Profile",
        breadcrumbs: [{ label: "Home", url: "/" }, { label: "User Profile" }],
      });
    }
  });
};
