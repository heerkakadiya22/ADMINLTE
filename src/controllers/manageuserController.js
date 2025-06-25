const db = require("../config/db");

exports.getalluser = (req, res) => {
  const id = req.session.adminId;

  const sql = "SELECT * FROM admin";
  db.query(sql, [id], (err, result) => {
    if (err || result.length === 0) {
      return res.render("manageuser", {
        csrfToken: req.csrfToken(),
        name: "",
        image: "/src/assets/image/uploads/profile-user.png",
      });
    }

    const user = result[0];
    const imagePath =
      "/src/assets/image/uploads/" + (user.image || "profile-user.png");

    return res.render("manageuser", {
      csrfToken: req.csrfToken(),
      name: user.name,
      image: imagePath,
      user: result,
    });
  });
};

// Show form
exports.showAddUser = (req, res) => {
  const id = req.session.adminId;

  const sql = "SELECT * FROM admin WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err || result.length === 0) {
      return res.render("adduser", {
        csrfToken: req.csrfToken(),
        name: "",
        image: "/src/assets/image/uploads/profile-user.png",
        error: "DB error or user not found",
      });
    }

    const user = result[0];
    const imagePath =
      "/src/assets/image/uploads/" + (user.image || "profile-user.png");

    res.render("adduser", {
      csrfToken: req.csrfToken(),
      name: user.name,
      image: imagePath,
    });
  });
};

exports.insertUser = (req, res) => {
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
    confirm_password,
  } = req.body;

  if (password !== confirm_password) {
    return res.render("adduser", {
      error: "Passwords do not match.",
      success: null,
      name: req.session.name || "",
    });
  }

  let imagePath = "/src/assets/image/uploads/profile-user.png";
  if (req.file) {
    imagePath = "/src/assets/image/uploads/" + req.file.filename;
  }

  const insertQuery = `
    INSERT INTO admin (name, email, phone, username, address, dob, gender, hobby, password, image)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    name,
    email,
    phone,
    username,
    address,
    dob,
    gender,
    hobby,
    password,
    imagePath,
  ];

  db.query(insertQuery, values, (err, result) => {
    if (err) {
      console.error("Insert Error:", err);
      return res.render("adduser", {
        error: "Something went wrong while adding the user.",
        success: null,
        name: req.session.name || "",
      });
    }
    return res.render("adduser", {
      success: `${name} added successfully.`,
      error: null,
      name: req.session.name || "",
    });
  });
};
