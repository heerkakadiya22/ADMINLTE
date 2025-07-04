const db = require("../config/db");
const path = require("path");
const fs = require("fs");

// ✅ GET ALL USERS
exports.getAllUser = (req, res) => {
  const id = req.session.adminId;

  const sql = "SELECT * FROM admin WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err || result.length === 0) {
      return res.render("manageuser", {
        csrfToken: req.csrfToken(),
        name: "",
        email: "",
        roleId: 0, // default
        image: "/src/assets/image/uploads/profile-user.png",
        user: [],
        currentPage: "manageuser",
        pageTitle: "User List",
        breadcrumbs: [{ label: "Home", url: "/" }, { label: "User List" }],
        success: null,
      });
    }

    const admin = result[0];
    const imagePath =
      "/src/assets/image/uploads/" + (admin.image || "profile-user.png");

    const successMessage = req.session.success;
    req.session.success = null;

    const userSql =
      "SELECT a.*, r.name AS role_name FROM admin a LEFT JOIN roles r ON a.roleId = r.id";

    db.query(userSql, (userErr, userResult) => {
      if (userErr) {
        console.error(userErr);
        return res.render("manageuser", {
          csrfToken: req.csrfToken(),
          name: admin.name,
          email: admin.email,
          roleId: admin.roleId, // ✅ added here
          image: imagePath,
          user: [],
          currentPage: "manageuser",
          pageTitle: "User List",
          breadcrumbs: [{ label: "Home", url: "/" }, { label: "User List" }],
          success: null,
        });
      }

      return res.render("manageuser", {
        csrfToken: req.csrfToken(),
        name: admin.name,
        email: admin.email,
        roleId: admin.roleId, // ✅ added here
        image: imagePath,
        user: userResult,
        currentPage: "manageuser",
        pageTitle: "User List",
        breadcrumbs: [{ label: "Home", url: "/" }, { label: "User List" }],
        success: successMessage,
      });
    });
  });
};

exports.showAddUser = (req, res) => {
  const id = req.session.adminId;

  const sqlAdmin = "SELECT * FROM admin WHERE id = ?";
  const sqlRoles = "SELECT * FROM roles";

  db.query(sqlAdmin, [id], (err, adminResult) => {
    if (err || adminResult.length === 0) {
      return res.redirect("/login");
    }

    const admin = adminResult[0];
    const imagePath = admin.image
      ? "/src/assets/image/uploads/" + admin.image
      : "/src/assets/image/uploads/profile-user.png";

    db.query(sqlRoles, (roleErr, roleResults) => {
      if (roleErr) {
        console.error("Error fetching roles:", roleErr);
        return res.status(500).send("Error loading form.");
      }

      const successMessage = req.session.success || null;
      delete req.session.success;

      res.render("adduser", {
        name: admin.name || "",
        roleId: admin.roleId || 0,
        csrfToken: req.csrfToken(),
        currentPage: "manageuser",
        error: null,
        success: successMessage,
        image: imagePath,
        pageTitle: "Add User",
        breadcrumbs: [
          { label: "Home", url: "/" },
          { label: "Manage Users", url: "/manageuser" },
          { label: "Add User" },
        ],
        roles: roleResults,
      });
    });
  });
};

// POST: Add User
exports.addUser = (req, res) => {
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
    roleId,
  } = req.body;

  // Password confirmation
  if (password !== confirmPassword) {
    return renderWithError("Passwords do not match.");
  }

  const image = req.file ? req.file.filename : "profile-user.png";
  const hobbyFormatted = hobby
    ? Array.isArray(hobby)
      ? hobby.join(",")
      : hobby
    : "";

  // Check if username or email already exists
  const checkSql = `
    SELECT * FROM admin 
    WHERE username = ? OR email = ?
  `;

  db.query(checkSql, [username, email], (err, existingUsers) => {
    if (err) {
      return renderWithError("Database error while checking existing users.");
    }

    if (existingUsers.length) {
      const existing = existingUsers[0];
      let conflictMessage = "A user with the same credentials already exists.";
      if (existing.username === username) {
        conflictMessage = "Username already exists.";
      } else if (existing.email === email) {
        conflictMessage = "Email already exists.";
      }
      return renderWithError(conflictMessage);
    }

    // ✅ Insert directly with roleId
    const insertSql = `
      INSERT INTO admin 
      (name, email, password, username, image, phone_no, address, hobby, dob, gender, roleId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      roleId,
    ];

    db.query(insertSql, values, (insertErr) => {
      if (insertErr) {
        console.error("Insert error:", insertErr);
        return renderWithError("Failed to add user.");
      }

      req.session.success = "User added successfully!";
      res.redirect("/manageuser");
    });
  });

  // Helper function to render with error
  function renderWithError(errorMessage) {
    const imagePath = req.session.image
      ? "/src/assets/image/uploads/" + req.session.image
      : "/src/assets/image/uploads/profile-user.png";

    // Re-fetch roles for the dropdown
    const sqlRoles = "SELECT * FROM roles";
    db.query(sqlRoles, (roleErr, roleResults) => {
      if (roleErr) {
        console.error("Error fetching roles:", roleErr);
        return res.status(500).send("Error loading form.");
      }

      res.render("adduser", {
        name: req.session.name || "",
        csrfToken: "",
        currentPage: "manageuser",
        error: errorMessage,
        success: null,
        image: imagePath,
        pageTitle: "Add User",
        breadcrumbs: [
          { label: "Home", url: "/" },
          { label: "Manage User", url: "/manageuser" },
          { label: "Add User" },
        ],
        roles: roleResults,
        roleId: roleId || "",
      });
    });
  }
};

//delete controller
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

// edit user controller
exports.showEditUser = (req, res) => {
  const selectedUserId = req.params.id;
  const currentAdminId = req.session.adminId;

  const getSelectedUserSql = "SELECT * FROM admin WHERE id = ?";
  const getCurrentAdminSql = "SELECT * FROM admin WHERE id = ?";
  const getRolesSql = "SELECT * FROM roles";

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

      db.query(getRolesSql, (err3, roleResults) => {
        if (err3) {
          return res.redirect("/manageuser");
        }

        const selectedImagePath = selectedUser.image
          ? "/src/assets/image/uploads/" + selectedUser.image
          : "/src/assets/image/uploads/profile-user.png";

        const currentImagePath = currentUser.image
          ? "/src/assets/image/uploads/" + currentUser.image
          : "/src/assets/image/uploads/profile-user.png";

        const dobformat =
          selectedUser.dob && !isNaN(new Date(selectedUser.dob))
            ? (() => {
                const dateObj = new Date(selectedUser.dob);
                const yyyy = dateObj.getFullYear();
                const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
                const dd = String(dateObj.getDate()).padStart(2, "0");
                return `${yyyy}-${mm}-${dd}`;
              })()
            : "";

        const successMessage = req.session.success;
        delete req.session.success;

        return res.render("edituser", {
          csrfToken: req.csrfToken(),

          // Logged-in admin info (for header/sidebar)
          name: currentUser.name,
          image: currentImagePath,
          roleId: currentUser.roleId,

          // User being edited
          editId: selectedUser.id,
          editName: selectedUser.name,
          editEmail: selectedUser.email,
          editPhone: selectedUser.phone_no,
          editUsername: selectedUser.username,
          editAddress: selectedUser.address,
          editDob: dobformat,
          editGender: selectedUser.gender,
          editHobby: selectedUser.hobby ? selectedUser.hobby.split(",") : [],
          editImage: selectedImagePath,
          editRoleId: selectedUser.roleId,

          roles: roleResults,
          currentPage: "manageuser",
          success: successMessage || null,
          error: null,
          pageTitle: "Edit User",
          breadcrumbs: [
            { label: "Home", url: "/" },
            { label: "User List", url: "/manageuser" },
            { label: "Edit User" },
          ],
        });
      });
    });
  });
};

// POST: Update selected user
// POST: Update User
exports.updateUser = (req, res) => {
  const {
    id,
    name,
    email,
    username,
    address,
    dob,
    gender,
    phone,
    hobby,
    roleId,
  } = req.body;

  if (!id || isNaN(Number(id))) {
    return res.status(400).send("Invalid request: Missing or invalid user ID.");
  }

  const newImage = req.file ? req.file.filename : null;

  // Get the existing image filename from DB
  const getImageSql = "SELECT image FROM admin WHERE id = ?";
  db.query(getImageSql, [id], (err, result) => {
    if (err || result.length === 0) {
      return res.status(500).send("User not found.");
    }

    const existingImage = result[0].image || "profile-user.png";
    const imageToUse = newImage || existingImage;

    // ✅ If new image uploaded and old image is not default, delete old file
    if (newImage && existingImage !== "profile-user.png") {
      const fs = require("fs");
      const path = require("path");
      const oldImagePath = path.join(
        __dirname,
        "../assets/image/uploads",
        existingImage
      );

      fs.unlink(oldImagePath, (unlinkErr) => {
        if (unlinkErr && unlinkErr.code !== "ENOENT") {
          console.error("Error deleting old image:", unlinkErr);
        }
      });
    }

    // Convert hobbies to comma-separated string
    let hobbyArray = [];
    if (hobby) {
      hobbyArray = Array.isArray(hobby) ? hobby : [hobby];
    }
    const hobbyString = hobbyArray.join(",");

    // Format date of birth
    let formattedDob = null;
    if (dob) {
      formattedDob = new Date(dob).toISOString().split("T")[0];
    }

    // ✅ Check uniqueness of username/email/phone
    const checkSql = `
      SELECT * FROM admin
      WHERE (username = ? OR email = ?) AND id != ?
    `;
    db.query(checkSql, [username, email, id], (checkErr, checkResults) => {
      if (checkErr) {
        return renderWithError("Database error while checking unique fields.");
      }

      if (checkResults.length) {
        const existing = checkResults[0];
        let conflictMessage =
          "A user with the same credentials already exists.";

        if (existing.username === username) {
          conflictMessage = "Username already exists.";
        } else if (existing.email === email) {
          conflictMessage = "Email already exists.";
        }
        return renderWithError(conflictMessage);
      }

      // ✅ No conflicts - Update the user
      const updateSql = `
        UPDATE admin SET 
          name = ?, email = ?, username = ?, image = ?,
          address = ?, dob = ?, gender = ?, phone_no = ?, hobby = ?,  roleId = ?
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
        roleId || null,
        id,
      ];

      db.query(updateSql, values, (updateErr, updateResult) => {
        if (updateErr || updateResult.affectedRows === 0) {
          return renderWithError("Database update failed or no changes made.");
        }

        req.session.success = "User updated successfully.";
        return res.redirect("/manageuser");
      });
    });

    function renderWithError(errorMessage) {
      const getRolesSql = "SELECT * FROM role";
      db.query(getRolesSql, (roleErr, roleResults) => {
        if (roleErr) {
          return res.status(500).send("Error fetching roles.");
        }

        res.render("edituser", {
          name: req.session.name,
          image: req.session.image,

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
          editRoleId: roleId || null,
          roles: roleResults,
          currentPage: "manageuser",
          error: errorMessage,
          success: null,
        });
      });
    }
  });
};
