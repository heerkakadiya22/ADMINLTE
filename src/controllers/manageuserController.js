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
        roleId: 0,
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

    const userSql = `
      SELECT a.*, r.name AS role_name
      FROM admin a
      LEFT JOIN roles r ON a.roleId = r.id
    `;

    db.query(userSql, (userErr, userResult) => {
      if (userErr) {
        return res.render("manageuser", {
          csrfToken: req.csrfToken(),
          name: admin.name,
          email: admin.email,
          roleId: admin.roleId,
          image: imagePath,
          user: [],
          currentPage: "manageuser",
          pageTitle: "User List",
          breadcrumbs: [{ label: "Home", url: "/" }, { label: "User List" }],
          success: null,
        });
      }

      res.render("manageuser", {
        csrfToken: req.csrfToken(),
        name: admin.name,
        email: admin.email,
        roleId: admin.roleId,
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

// ✅ SHOW ADD USER
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
        return res.status(500).send("Error loading form.");
      }

      res.render("userForm", {
        isEdit: false,
        name: admin.name,
        roleId: admin.roleId,
        csrfToken: req.csrfToken(),
        currentPage: "manageuser",
        error: null,
        success: null,
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

// ✅ ADD USER
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

  if (password !== confirmPassword) {
    return renderWithError("Passwords do not match.");
  }

  const image = req.file ? req.file.filename : "profile-user.png";
  const hobbyFormatted = hobby
    ? Array.isArray(hobby)
      ? hobby.join(",")
      : hobby
    : "";

  const checkSql = `SELECT * FROM admin WHERE username = ? OR email = ?`;
  db.query(checkSql, [username, email], (err, existingUsers) => {
    if (err) {
      return renderWithError("Database error while checking existing users.");
    }
    if (existingUsers.length) {
      const existing = existingUsers[0];
      let conflict = "A user with the same credentials already exists.";
      if (existing.username === username) conflict = "Username already exists.";
      if (existing.email === email) conflict = "Email already exists.";
      return renderWithError(conflict);
    }

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
        return renderWithError("Failed to add user.");
      }
      req.session.success = "User added successfully!";
      res.redirect("/manageuser");
    });
  });

  function renderWithError(errorMessage) {
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
        res.render("userForm", {
          isEdit: false,
          name: admin.name,
          roleId: admin.roleId,
          csrfToken: req.csrfToken(),
          currentPage: "manageuser",
          error: errorMessage,
          success: null,
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
  }
};

// ✅ SHOW EDIT USER
exports.showEditUser = (req, res) => {
  const userId = req.params.id;
  const adminId = req.session.adminId;

  const getUserSql = "SELECT * FROM admin WHERE id = ?";
  const getAdminSql = "SELECT * FROM admin WHERE id = ?";
  const getRolesSql = "SELECT * FROM roles";

  db.query(getUserSql, [userId], (err, userResult) => {
    if (err || userResult.length === 0) {
      return res.redirect("/manageuser");
    }
    const user = userResult[0];

    db.query(getAdminSql, [adminId], (err2, adminResult) => {
      if (err2 || adminResult.length === 0) {
        return res.redirect("/login");
      }
      const admin = adminResult[0];

      db.query(getRolesSql, (err3, roles) => {
        const dobFormatted = user.dob
          ? (() => {
              const d = new Date(user.dob);
              const yyyy = d.getFullYear();
              const mm = String(d.getMonth() + 1).padStart(2, "0");
              const dd = String(d.getDate()).padStart(2, "0");
              return `${yyyy}-${mm}-${dd}`;
            })()
          : "";

        res.render("userForm", {
          isEdit: true,
          name: admin.name,
          roleId: admin.roleId,
          csrfToken: req.csrfToken(),
          currentPage: "manageuser",
          error: null,
          success: null,
          image:
            "/src/assets/image/uploads/" + (admin.image || "profile-user.png"),
          pageTitle: "Edit User",
          breadcrumbs: [
            { label: "Home", url: "/" },
            { label: "Manage Users", url: "/manageuser" },
            { label: "Edit User" },
          ],
          roles,
          editId: user.id,
          editName: user.name,
          editEmail: user.email,
          editPhone: user.phone_no,
          editUsername: user.username,
          editAddress: user.address,
          editDob: dobFormatted,
          editGender: user.gender,
          editHobby: user.hobby ? user.hobby.split(",") : [],
          editImage:
            "/src/assets/image/uploads/" + (user.image || "profile-user.png"),
          editRoleId: user.roleId,
        });
      });
    });
  });
};

// ✅ UPDATE USER
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

  if (!id) {
    return res.status(400).send("Invalid user ID.");
  }

  const newImage = req.file ? req.file.filename : null;

  const getImageSql = "SELECT image FROM admin WHERE id = ?";
  db.query(getImageSql, [id], (err, result) => {
    if (err || result.length === 0) {
      return res.status(500).send("User not found.");
    }
    const oldImage = result[0].image || "profile-user.png";
    const finalImage = newImage || oldImage;

    if (newImage && oldImage !== "profile-user.png") {
      const oldPath = path.join(__dirname, "../assets/image/uploads", oldImage);
      fs.unlink(oldPath, (unlinkErr) => {
        if (unlinkErr && unlinkErr.code !== "ENOENT") {
          console.error("Failed to delete old image:", unlinkErr);
        }
      });
    }

    const hobbyString = hobby
      ? Array.isArray(hobby)
        ? hobby.join(",")
        : hobby
      : "";
    const formattedDob = dob || null;

    const checkSql = `SELECT * FROM admin WHERE (username = ? OR email = ?) AND id != ?`;
    db.query(checkSql, [username, email, id], (checkErr, exists) => {
      if (checkErr)
        return renderWithError("Database error checking uniqueness.");
      if (exists.length) {
        const conflict =
          exists[0].username === username
            ? "Username already exists."
            : "Email already exists.";
        return renderWithError(conflict);
      }

      const updateSql = `
        UPDATE admin SET
        name = ?, email = ?, username = ?, image = ?, address = ?, dob = ?, gender = ?, phone_no = ?, hobby = ?, roleId = ?
        WHERE id = ?
      `;
      const params = [
        name,
        email,
        username,
        finalImage,
        address,
        formattedDob,
        gender,
        phone,
        hobbyString,
        roleId || null,
        id,
      ];

      db.query(updateSql, params, (updateErr) => {
        if (updateErr) return renderWithError("Update failed.");
        req.session.success = "User updated successfully.";
        res.redirect("/manageuser");
      });
    });

    function renderWithError(errorMessage) {
      const getRolesSql = "SELECT * FROM roles";
      db.query(getRolesSql, (roleErr, roles) => {
        res.render("userForm", {
          isEdit: true,
          name: req.session.name,
          roleId: req.session.roleId,
          csrfToken: req.csrfToken(),
          currentPage: "manageuser",
          error: errorMessage,
          success: null,
          image: "/src/assets/image/uploads/" + finalImage,
          pageTitle: "Edit User",
          breadcrumbs: [
            { label: "Home", url: "/" },
            { label: "Manage Users", url: "/manageuser" },
            { label: "Edit User" },
          ],
          roles,
          editId: id,
          editName: name,
          editEmail: email,
          editPhone: phone,
          editUsername: username,
          editAddress: address,
          editDob: formattedDob,
          editGender: gender,
          editHobby: hobby ? (Array.isArray(hobby) ? hobby : [hobby]) : [],
          editImage: "/src/assets/image/uploads/" + finalImage,
          editRoleId: roleId || null,
        });
      });
    }
  });
};

// ✅ DELETE USER
exports.deleteUser = (req, res) => {
  const userId = req.params.id;

  const getUserSql = "SELECT name, image FROM admin WHERE id = ?";
  db.query(getUserSql, [userId], (err, userResult) => {
    if (err || userResult.length === 0) {
      return res.redirect("/manageuser");
    }

    const { name: userName, image } = userResult[0];
    const deleteSql = "DELETE FROM admin WHERE id = ?";

    db.query(deleteSql, [userId], (err2) => {
      if (!err2 && image && image !== "profile-user.png") {
        const imagePath = path.join(
          __dirname,
          "../assets/image/uploads",
          image
        );
        fs.unlink(imagePath, (unlinkErr) => {
          if (unlinkErr && unlinkErr.code !== "ENOENT")
            console.error("Image delete failed:", unlinkErr);
        });
      }

      req.session.success = `User "${userName}" deleted successfully!`;
      res.redirect("/manageuser");
    });
  });
};
