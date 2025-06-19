const db = require("../config/db");

//editprofile controller
exports.showEditProfile = (req, res) => {
  const id = req.session.adminId;
  const sql = "SELECT * FROM admin WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.render("editProfile", {
        error: "DB error",
      });
    }
    return res.render("editProfile", {
      name: req.session.name,
      email: req.session.email,
    });
  });
};

exports.updateProfile = (req, res) => {
  const { name, email, username, address, dob, gender, phone, hobby } =
    req.body;

  const id = req.session.adminId;
  const newimage = req.file
    ? req.file.filename
    : req.session.image || "/assets/image/uploads/profile-user.png";

  const updatesql =
    "UPDATE admin SET name = ?, email = ?, username = ?, image = ?, address = ?, dob = ?, gender = ?, phone_no = ?, hobby = ? WHERE id = ?";

  const values = [
    name,
    email,
    username,
    newimage,
    address,
    dob,
    gender,
    phone,
    hobby,
    id,
  ];

  db.query(updatesql, values, (err, result) => {
    if (err) {
      console.error("Update SQL Error:", err); 
      return res.render("editProfile", {
        name: req.session.name,
        email: req.session.email,
        newimage: req.session.image,
        error: "Database update failed.",
      });
    }

    if (result.affectedRows === 0) {
      console.warn("Update warning: No rows affected.");
      return res.render("editProfile", {
        name: req.session.name,
        email: req.session.email,
        newimage: req.session.image,
        error: "No changes made or user not found.",
      });
    }

    req.session.name = name;
    req.session.email = email;
    req.session.image = newimage;

    return res.render("editProfile", {
      name: req.session.name,
      email: req.session.email,
      newimage: req.session.image,
      success: "Profile updated successfully.",
    });
  });
};
