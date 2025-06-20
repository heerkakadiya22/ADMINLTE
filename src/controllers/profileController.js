const path = require("path");
const db = require("../config/db");

// GET: Show profile edit form
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
        hobby: "",
        image: "/src/assets/image/uploads/profile-user.png",
        error: "DB error or user not found",
        success: null,
        csrfToken: req.csrfToken(),
      });
    }

    const user = result[0];

    // Format DOB to YYYY-MM-DD if it exists
    const formattedDob = user.dob
      ? new Date(user.dob.getTime() - user.dob.getTimezoneOffset() * 60000)
          .toISOString()
          .split("T")[0]
      : "";

    // Build full image path
    const imagePath =
      "/src/assets/image/uploads/" + (user.image || "profile-user.png");

    const successMsg = req.session.successMsg || null;
    delete req.session.successMsg;

    res.render("editProfile", {
      name: user.name,
      email: user.email,
      username: user.username,
      address: user.address,
      dob: formattedDob,
      gender: user.gender,
      phone: user.phone_no,
      hobby: user.hobby,
      image: imagePath,
      success: successMsg,
      error: null,
      csrfToken: req.csrfToken(),
    });
  });
};

// POST: Update profile
exports.updateProfile = (req, res) => {
  const { name, email, username, address, dob, gender, phone, hobby } =
    req.body;

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
        hobby,
        image: "/src/assets/image/uploads/profile-user.png",
        error: "Failed to fetch existing image.",
        success: null,
      });
    }

    const currentImage = result[0].image || "profile-user.png";
    const imageToUse = newImage || currentImage;

    const sql = `
    UPDATE admin SET 
      name = ?, email = ?, username = ?, image = ?, 
      address = ?, dob = ?, gender = ?, phone_no = ?, hobby = ?
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
      hobby,
      id,
    ];

    db.query(sql, values, (err, result) => {
      if (err || result.affectedRows === 0) {
        const imagePath = "/src/assets/image/uploads/" + image;
        return res.render("editProfile", {
          name,
          email,
          username,
          address,
          dob,
          gender,
          phone,
          hobby,
          image: "/src/assets/image/uploads/" + imageToUse,
          error: "Database update failed or no changes made.",
          success: null,
        });
      }

      // Update session
      req.session.name = name;
      req.session.email = email;
      req.session.image = imageToUse;
      req.session.successMsg = "Profile updated successfully.";

      res.redirect("/editprofile");
    });
  });
};
