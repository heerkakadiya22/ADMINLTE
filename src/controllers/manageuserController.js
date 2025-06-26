const db = require("../config/db");

exports.getalluser = (req, res) => {
  const id = req.session.adminId;

  // Select only the current logged-in admin
  const sql = "SELECT * FROM admin WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err || result.length === 0) {
      return res.render("manageuser", {
        csrfToken: req.csrfToken(),
        name: "",
        image: "/src/assets/image/uploads/profile-user.png",
        user: [],
      });
    }

    const admin = result[0];
    const imagePath =
      "/src/assets/image/uploads/" + (admin.image || "profile-user.png");

    // Now fetch all users for display in table
    const userSql = "SELECT * FROM admin";
    db.query(userSql, (userErr, userResult) => {
      if (userErr) {
        return res.render("manageuser", {
          csrfToken: req.csrfToken(),
          name: admin.name,
          image: imagePath,
          user: [],
        });
      }

      return res.render("manageuser", {
        csrfToken: req.csrfToken(),
        name: admin.name,
        image: imagePath,
        user: userResult,
      });
    });
  });
};

exports.showadduser = (req, res) => {
  const id = req.session.adminId;

  const sql = "SELECT * FROM admin WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err || result.length === 0) {
      return res.redirect("/login");
    }
    const user = result[0];
    const imagePath = user.image
      ? "/src/assets/image/uploads/" + user.image
      : "/src/assets/image/uploads/profile-user.png";

    const successMessage = req.session.success;
    delete req.session.success;

    return res.render("adduser", {
      csrfToken: req.csrfToken(),
      name: user.name,
      image: imagePath,
      success: successMessage || null,
    });
  });
};
exports.insertuser = (req, res) => {
  const {
    name,
    email,
    phone,
    username,
    address,
    dob,
    gender,
    hobby,
    password,
    confirmPassword,
  } = req.body;

  if (password !== confirmPassword) {
    return res.render("adduser", {
      error: "Passwords do not match",
      name: req.session.adminName,
      image:
        req.session.adminImage || "/src/assets/image/uploads/profile-user.png",
      csrfToken: "",
    });
  }

  const image = req.file ? req.file.filename : "profile-user.png";

  const hobbyFormatted = Array.isArray(hobby) ? hobby.join(",") : hobby;

  const insertSql = `
    INSERT INTO admin (name, email, password, username, image, phone_no, address, hobby, dob, gender)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    name,
    email,
    password,
    username,
    image,
    phone,
    address,
    hobbyFormatted,
    dob,
    gender,
  ];

  db.query(insertSql, values, (err, result) => {
    if (err) {
      console.error("SQL Error:", err.sqlMessage);
      return res.render("adduser", {
        error: "Failed to add user.",
        name: req.session.adminName,
        image:
          req.session.adminImage ||
          "/src/assets/image/uploads/profile-user.png",
        csrfToken: "",
      });
    }

    req.session.success = "User added successfully!";
    return res.redirect("adduser");
  });
};
