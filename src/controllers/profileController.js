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
    });

    req.session.successMsg = null;
  });
};

// POST: Update profile
exports.updateProfile = (req, res) => {
  let { name, email, username, address, dob, gender, phone, hobby } = req.body;
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
      });
    }

    const currentImage = result[0].image || "profile-user.png";
    const imageToUse = newImage || currentImage;

    if (!hobby) hobby = [];
    else if (!Array.isArray(hobby)) hobby = [hobby];

    const hobbyString = hobby.join(",");

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
      hobbyString,
      id,
    ];

    db.query(sql, values, (err, result) => {
      if (err || result.affectedRows === 0) {
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
