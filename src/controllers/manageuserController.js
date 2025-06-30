const db = require("../config/db");
const path = require("path");
const fs = require("fs");

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

    const successMessage = req.session.success;
    req.session.success = null;

    // Now fetch all users for display in table
    const userSql = "SELECT * FROM admin";
    db.query(userSql, (userErr, userResult) => {
      if (userErr) {
        return res.render("manageuser", {
          csrfToken: req.csrfToken(),
          name: admin.name,
          image: imagePath,
          user: [],
          success: req.session.success,
          currentPage: "manageuser",
        });
      }

      return res.render("manageuser", {
        csrfToken: req.csrfToken(),
        name: admin.name,
        image: imagePath,
        user: userResult,
        success: successMessage,
        currentPage: "manageuser",
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
      currentPage: "manageuser",
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
    return res.redirect("/manageuser");
  });
};

exports.deleteUser = (req, res) => {
  const userId = req.params.id;

  const getUserSql = "SELECT name, image FROM admin WHERE id = ?";
  db.query(getUserSql, [userId], (err, userResult) => {
    if (err || userResult.length === 0) {
      return res.render("manageuser", {
        error: "User not found or failed to fetch.",
      });
    }

    const userName = userResult[0].name;
    const imageFile = userResult[0].image;

    const deleteSql = "DELETE FROM admin WHERE id = ?";
    db.query(deleteSql, [userId], (err) => {
      if (err) {
        return res.render("manageuser", {
          error: "Failed to delete user.",
        });
      }

      if (imageFile) {
        const imagePath = path.join(
          __dirname,
          "..",
          "assets",
          "image",
          "uploads",
          imageFile
        );

        fs.unlink(imagePath, (unlinkErr) => {
          // Ignore if file not found
          if (unlinkErr && unlinkErr.code !== "ENOENT") {
            console.error("Error deleting image file:", unlinkErr);
          }
        });
      }

      req.session.success = `User "${userName}" deleted successfully!`;
      return res.redirect("/manageuser");
    });
  });
};

// GET: Show Edit User Form
exports.showedituser = (req, res) => {
  const selectedUserId = req.params.id;
  const currentAdminId = req.session.adminId;

  const getSelectedUserSql = "SELECT * FROM admin WHERE id = ?";
  const getCurrentAdminSql = "SELECT * FROM admin WHERE id = ?";

  db.query(getSelectedUserSql, [selectedUserId], (err, selectedResult) => {
    if (err || selectedResult.length === 0) {
      return res.redirect("/manageuser");
    }
    const selectedUser = selectedResult[0];

    db.query(getCurrentAdminSql, [currentAdminId], (err2, currentResult) => {
      if (err2 || currentResult.length === 0) {
        return res.redirect("/login");
      }
      const currentUser = currentResult[0];

      const selectedImagePath = selectedUser.image
        ? "/src/assets/image/uploads/" + selectedUser.image
        : "/src/assets/image/uploads/profile-user.png";

      const currentImagePath = currentUser.image
        ? "/src/assets/image/uploads/" + currentUser.image
        : "/src/assets/image/uploads/profile-user.png";

      const successMessage = req.session.success;
      delete req.session.success;

      return res.render("edituser", {
        csrfToken: req.csrfToken(),

        // logged-in admin info (for header/sidebar)
        name: currentUser.name,
        image: currentImagePath,

        // user being edited
        editId: selectedUser.id,
        editName: selectedUser.name,
        editEmail: selectedUser.email,
        editPhone: selectedUser.phone_no,
        editUsername: selectedUser.username,
        editAddress: selectedUser.address,
        editDob:
          selectedUser.dob && !isNaN(new Date(selectedUser.dob))
            ? new Date(selectedUser.dob).toISOString().split("T")[0]
            : "",

        editGender: selectedUser.gender,
        editHobby: selectedUser.hobby ? selectedUser.hobby.split(",") : [],
        editImage: selectedImagePath,

        currentPage: "manageuser",
        success: successMessage || null,
        error: null,
      });
    });
  });
};

// POST: Update selected user
// POST: Update User
exports.updateUser = (req, res) => {
  const { id, name, email, username, address, dob, gender, phone, hobby } =
    req.body;

  if (!id || isNaN(Number(id))) {
    return res.status(400).send("Invalid request: Missing or invalid user ID.");
  }

  const newImage = req.file ? req.file.filename : null;

  const getImageSql = "SELECT image FROM admin WHERE id = ?";
  db.query(getImageSql, [id], (err, result) => {
    if (err || result.length === 0) {
      return res.status(500).send("User not found.");
    }

    const existingImage = result[0].image || "profile-user.png";
    const imageToUse = newImage || existingImage;

    let hobbyArray = [];
    if (hobby) {
      hobbyArray = Array.isArray(hobby) ? hobby : [hobby];
    }
    const hobbyString = hobbyArray.join(",");

    let formattedDob = null;
    if (dob) {
      formattedDob = new Date(dob).toISOString().split("T")[0];
    }

    const updateSql = `
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
      formattedDob,
      gender,
      phone,
      hobbyString,
      id,
    ];

    db.query(updateSql, values, (updateErr, updateResult) => {
      if (updateErr || updateResult.affectedRows === 0) {
        return res.render("edituser", {
          csrfToken: req.csrfToken(),

          // logged-in admin info
          name: req.session.name,
          image: req.session.image,

          // pre-fill form fields with submitted data
          editId: id,
          editName: name,
          editEmail: email,
          editUsername: username,
          editAddress: address,
          editDob: formattedDob,
          editGender: gender,
          editPhone: phone,
          editHobby: hobbyArray,
          editImage: "/src/assets/image/uploads/" + imageToUse,

          currentPage: "manageuser",
          success: null,
          error: "Database update failed or no changes made.",
        });
      }

      req.session.success = "User updated successfully.";
      return res.redirect("/manageuser");
    });
  });
};
