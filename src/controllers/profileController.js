const db = require("../config/db");

//editprofile controller
exports.showEditProfile = (req, res) => {
  return res.render("editProfile", {
    csrfToken: req.csrfToken(),
    name: req.session.name,
  });
};

exports.updateProfile = (req, res) => {
  const { name, email, username, image, address, dob, gender, phone, hobby } =
    req.body;

  const id = req.session.id;

  if (!id) {
    return res.redirect("/login");
  }
  const newimage = req.file ? req.file.filename : null;

  const updatesql =
    "UPDATE admin SET  name = ?, email = ?, username = ?, image = ?, address = ?, dob = ?, gender = ?, phone_no = ?, hobby = ? WHERE id = ?";

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
    if (err || result.affectedRows === 0) {
      return res.render("editProfile", {
        error: "Update error",
        csrfToken: req.csrfToken(),
      });
    }

    return res.render("editProfile", {
      success: "Profile updated successfully.",
      csrfToken: req.csrfToken(),
    });
  });
};
