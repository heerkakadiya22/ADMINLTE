const path = require("path");
const db = require("../config/db");

// GET: Show edit profile
exports.showEditProfile = (req, res) => {
  const id = req.session.adminId;
  const sql = "SELECT * FROM admin WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err || result.length === 0) {
      return res.render("editProfile", {
        name: "",
        email: "",
        username: "",
        address: "",
        dob: "",
        gender: "",
        phone: "",
        hobby: [],
        image: "/src/assets/image/uploads/profile-user.png",
        error: "DB error or user not found",
        success: null,
        csrfToken: req.csrfToken(),
      });
    }

    const user = result[0];
    let dobFormatted = "";
    if (user.dob) {
      const parsedDate = new Date(user.dob);
      if (!isNaN(parsedDate)) {
        dobFormatted = new Date(
          parsedDate.getTime() - parsedDate.getTimezoneOffset() * 60000
        )
          .toISOString()
          .split("T")[0];
      }
    }

    const hobbyArray = user.hobby ? user.hobby.split(",") : [];
    console.log("Session successMsg at render:", req.session.successMsg);
    res.render("editProfile", {
      name: user.name,
      email: user.email,
      username: user.username,
      address: user.address,
      dob: dobFormatted,
      gender: user.gender,
      phone: user.phone_no,
      hobby: hobbyArray,
      image: "/src/assets/image/uploads/" + (user.image || "profile-user.png"),
      error: null,
      success: req.session.successMsg || null,
      csrfToken: req.csrfToken(),
      currentPage: "editprofile",
      pageTitle: "User Profile",
      breadcrumbs: [{ label: "Home", url: "/" }, { label: "User Profile" }],
    });

    req.session.successMsg = null;
  });
};

// POST: Update profile
exports.updateProfile = (req, res) => {
  const { name, email, username, address, dob, gender, phone } = req.body;
  let { hobby } = req.body;
  const id = req.session.adminId;
  const newImage = req.file ? req.file.filename : null;

  const getImageSql = "SELECT image FROM admin WHERE id = ?";

  db.query(getImageSql, [id], (err, result) => {
    if (err || result.length === 0) {
      return res.render("editProfile", {
        name,
        email,
        username,
        address,
        dob,
        gender,
        phone,
        hobby: Array.isArray(hobby) ? hobby : hobby ? [hobby] : [],
        image: "/src/assets/image/uploads/profile-user.png",
        error: "Failed to fetch existing image.",
        success: null,
        csrfToken: req.csrfToken(),
        currentPage: "editprofile",
      });
    }

    const currentImage = result[0].image || "profile-user.png";
    const imageToUse = newImage || currentImage;

    // ✅ Delete the old image if new one uploaded and it's not default
    if (newImage && currentImage !== "profile-user.png") {
      const fs = require("fs");
      const path = require("path");
      const oldImagePath = path.join(
        __dirname,
        "../assets/image/uploads",
        currentImage
      );

      if (fs.existsSync(oldImagePath)) {
        fs.unlink(oldImagePath, (unlinkErr) => {
          if (unlinkErr) {
            console.error("Error deleting old image:", unlinkErr);
          } else {
            console.log("Old image deleted successfully:", oldImagePath);
          }
        });
      } else {
        console.log("Old image file not found to delete:", oldImagePath);
      }
    }

    // ✅ Normalize hobbies
    if (!hobby) {
      hobby = [];
    } else if (!Array.isArray(hobby)) {
      hobby = [hobby];
    }
    const hobbyString = hobby.join(",");

    // ✅ Check for duplicate username or phone
    const checkSql = `
      SELECT * FROM admin 
      WHERE (username = ? OR email = ?) AND id != ?
    `;
    db.query(checkSql, [username, email, id], (err, checkResults) => {
      if (err) {
        return renderWithError("Database error while checking unique fields.");
      }

      if (checkResults.length) {
        const existing = checkResults[0];
        const conflictMessage =
          existing.username === username
            ? "Username already exists."
            : "email already exists.";
        return renderWithError(conflictMessage);
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
          hobby = ?
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
        id,
      ];

      db.query(updateSql, values, (err) => {
        if (err) {
          return renderWithError("Database update failed.");
        }

        // ✅ Update session data
        req.session.name = name;
        req.session.email = email;
        req.session.image = imageToUse;
        req.session.successMsg = "Profile updated successfully.";

        req.session.save((err) => {
          if (err) {
            console.error("Session save error:", err);
          }
          res.redirect("/editprofile");
        });
      });
    });

    // ✅ Helper to render with error
    function renderWithError(errorMessage) {
      res.render("editProfile", {
        name,
        email,
        username,
        address,
        dob,
        gender,
        phone,
        hobby,
        image: "/src/assets/image/uploads/" + imageToUse,
        error: errorMessage,
        success: null,
        csrfToken: req.csrfToken(),
        currentPage: "editprofile",
      });
    }
  });
};
