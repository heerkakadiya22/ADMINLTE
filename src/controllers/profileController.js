const db = require("../config/db");

//editprofile controller
exports.showEditProfile = (req, res) => {
  return res.render("editprofile", {
    name: req.session.name,
    email: req.session.email,
    csrfToken: req.csrfToken(),
  });
};

exports.updateProfile = (req, res) => {
  const { name, email, username, address, dob, gender, phone, hobby } =
    req.body;

  const id = req.session.adminId;

  if (!id) {
    return res.redirect("/login");
  }
  const newimage = req.file ? req.file.filename : null;

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

  req.session.name = name;
  req.session.email = email;
  req.session.image = newimage;

  db.query(updatesql, values, (err, result) => {
    if (err || result.affectedRows === 0) {
      return res.render("editprofile", {
        name: req.session.name,
        email: req.session.email,
        newimage: req.session.image,
        csrfToken: req.csrfToken(),
        error: "Update error",
      });
    }

    return res.render("editprofile", {
      name: req.session.name,
      email: req.session.email,
      newimage: req.session.image,
      csrfToken: req.csrfToken(),
      success: "Profile updated successfully.",
    });
  });
};
