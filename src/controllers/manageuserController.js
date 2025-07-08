// manageuserController.js using Sequelize + Repository Pattern
const adminRepo = require("../../repositories/adminRepository");
const roleRepo = require("../../repositories/roleRepository");
const imageHelper = require("../helpers/imageHelper");
const dobHelper = require("../helpers/dobHelper");

// Render Manage Users Page
exports.getAllUser = async (req, res) => {
  const id = req.session.adminId;
  try {
    const admin = await adminRepo.findById(id);
    if (!admin) return renderManageUser(res, req.csrfToken(), "", "", 0, null);

    return renderManageUser(
      res,
      req.csrfToken(),
      admin.name,
      admin.email,
      admin.roleId,
      imageHelper.getImageUrl(admin.image),
      req.session.success
    );
  } catch (err) {
    console.error(err);
    return renderManageUser(res, req.csrfToken(), "", "", 0, null);
  }

  function renderManageUser(
    res,
    csrfToken,
    name,
    email,
    roleId,
    image,
    success = null
  ) {
    req.session.success = null;
    res.render("manageuser", {
      csrfToken,
      name,
      email,
      roleId,
      image: image || imageHelper.getImageUrl(),
      currentPage: "manageuser",
      pageTitle: "User List",
      breadcrumbs: [{ label: "Home", url: "/" }, { label: "User List" }],
      success,
    });
  }
};

// Return users JSON
exports.apiGetAllUsers = async (req, res) => {
  try {
    const users = await adminRepo.findWithRoles();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users." });
  }
};

// Show Add User Form
exports.showAddUser = async (req, res) => {
  try {
    const admin = await adminRepo.findById(req.session.adminId);
    const roles = await roleRepo.getAll();
    const image = imageHelper.getImageUrl(admin.image);

    res.render("userForm", {
      isEdit: false,
      name: admin.name,
      roleId: admin.roleId,
      csrfToken: req.csrfToken(),
      currentPage: "manageuser",
      error: null,
      success: null,
      image,
      pageTitle: "Add User",
      breadcrumbs: [
        { label: "Home", url: "/" },
        { label: "Manage Users", url: "/manageuser" },
        { label: "Add User" },
      ],
      roles,
      editRoleId: null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading form.");
  }
};

// Add User
exports.addUser = async (req, res) => {
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

  if (password !== confirmPassword)
    return renderWithError("Passwords do not match.");

  const image = imageHelper.saveImage(req.file);
  const hobbyFormatted = Array.isArray(hobby) ? hobby.join(",") : hobby || "";

  try {
    const existingUser = await adminRepo.findByUsernameOrEmail(username, email);
    if (existingUser) {
      let conflict = "A user with the same credentials already exists.";
      if (existingUser.username === username)
        conflict = "Username already exists.";
      if (existingUser.email === email) conflict = "Email already exists.";
      return renderWithError(conflict);
    }

    await adminRepo.createUser({
      name,
      email,
      password,
      username,
      image,
      phone_no: phone,
      address,
      hobby: hobbyFormatted,
      dob,
      gender,
      roleId,
    });

    req.session.success = "User added successfully!";
    res.redirect("/manageuser");
  } catch (error) {
    console.error(error);
    renderWithError("Failed to add user.");
  }

  async function renderWithError(errorMessage) {
    const admin = await adminRepo.findById(req.session.adminId);
    const roles = await roleRepo.getAll();
    const image = imageHelper.getImageUrl(admin.image);

    res.render("userForm", {
      isEdit: false,
      name: admin.name,
      roleId: admin.roleId,
      csrfToken: req.csrfToken(),
      currentPage: "manageuser",
      error: errorMessage,
      success: null,
      image,
      pageTitle: "Add User",
      breadcrumbs: [
        { label: "Home", url: "/" },
        { label: "Manage Users", url: "/manageuser" },
        { label: "Add User" },
      ],
      roles,
    });
  }
};

// Show Edit User
exports.showEditUser = async (req, res) => {
  try {
    const user = await adminRepo.findById(req.params.id);
    const admin = await adminRepo.findById(req.session.adminId);
    const roles = await roleRepo.findAll();

    if (!user || !admin) return res.redirect("/manageuser");

    res.render("userForm", {
      isEdit: true,
      name: admin.name,
      roleId: admin.roleId,
      csrfToken: req.csrfToken(),
      currentPage: "manageuser",
      error: null,
      success: null,
      image: imageHelper.getImageUrl(admin.image),
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
      editDob: dobHelper.formatDob(user.dob),
      editGender: user.gender,
      editHobby: user.hobby ? user.hobby.split(",") : [],
      editImage: imageHelper.getImageUrl(user.image),
      editRoleId: user.roleId || null,
    });
  } catch (err) {
    console.error(err);
    res.redirect("/manageuser");
  }
};

// Update User
exports.updateUser = async (req, res) => {
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

  const newImage = req.file ? imageHelper.saveImage(req.file) : null;
  const hobbyString = Array.isArray(hobby) ? hobby.join(",") : hobby || "";

  try {
    const user = await adminRepo.findById(id);
    if (!user) return res.status(404).send("User not found.");

    const existing = await adminRepo.findByUsernameOrEmail(username, email);
    if (existing && existing.id !== parseInt(id)) {
      const conflict =
        existing.username === username
          ? "Username already exists."
          : "Email already exists.";
      return renderWithError(conflict);
    }

    const finalImage = newImage || user.image;
    if (newImage && !imageHelper.isDefaultImage(user.image)) {
      imageHelper.deleteImage(user.image);
    }

    await adminRepo.updateUser(id, {
      name,
      email,
      username,
      image: finalImage,
      address,
      dob,
      gender,
      phone_no: phone,
      hobby: hobbyString,
      roleId: roleId || null,
    });

    req.session.success = "User updated successfully.";
    res.redirect("/manageuser");
  } catch (err) {
    console.error(err);
    renderWithError("Update failed.");
  }

  async function renderWithError(errorMessage) {
    const roles = await roleRepo.findAll();
    const image = imageHelper.getImageUrl(newImage);

    res.render("userForm", {
      isEdit: true,
      name: req.session.name,
      roleId: req.session.roleId,
      csrfToken: req.csrfToken(),
      currentPage: "manageuser",
      error: errorMessage,
      success: null,
      image,
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
      editDob: dob,
      editGender: gender,
      editHobby: hobby ? (Array.isArray(hobby) ? hobby : [hobby]) : [],
      editImage: image,
      editRoleId: roleId || null,
    });
  }
};

// Delete User
exports.deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await adminRepo.findById(userId);
    if (!user) return res.redirect("/manageuser");

    await adminRepo.deleteUser(userId);
    imageHelper.deleteImage(user.image);

    req.session.success = `User "${user.name}" deleted successfully!`;
    res.redirect("/manageuser");
  } catch (err) {
    console.error(err);
    res.redirect("/manageuser");
  }
};
