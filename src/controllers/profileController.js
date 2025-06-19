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
      });
    }

    const user = result[0];

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
      dob: user.dob,
      gender: user.gender,
      phone: user.phone_no,
      hobby: user.hobby,
      image: imagePath,
      success: successMsg,
      error: null,
    });
  });
};

// POST: Update profile
exports.updateProfile = (req, res) => {
  const { name, email, username, address, dob, gender, phone, hobby } =
    req.body;

  const id = req.session.adminId;
  const image = req.file
    ? req.file.filename
    : req.session.image || "profile-user.png";

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
    image,
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
        image: imagePath,
        error: "Database update failed or no changes made.",
        success: null,
      });
    }

    // Update session
    req.session.name = name;
    req.session.email = email;
    req.session.image = image;
    req.session.successMsg = "Profile updated successfully.";

    res.redirect("/editprofile");
  });
};
