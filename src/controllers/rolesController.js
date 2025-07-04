const db = require("../config/db");
const { Role, sequelize } = require("../../models");

// controllers/roleController.js

exports.getAllRoles = (req, res) => {
  const id = req.session.adminId;

  const sql = "SELECT * FROM admin WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err || result.length === 0) {
      return res.render("rolelist", {
        csrfToken: "",
        name: "",
        image: "/src/assets/image/uploads/profile-user.png",
        roleId: 0,
        success: null,
        currentPage: "rolelist",
        pageTitle: "Role List",
        breadcrumbs: [{ label: "Home", url: "/" }, { label: "Role List" }],
      });
    }

    const admin = result[0];
    const imagePath = admin.image
      ? "/src/assets/image/uploads/" + admin.image
      : "/src/assets/image/uploads/profile-user.png";

    const successMessage = req.session.success;
    req.session.success = null;

    res.render("rolelist", {
      csrfToken: "",
      name: admin.name,
      image: imagePath,
      roleId: admin.roleId,
      success: successMessage,
      currentPage: "rolelist",
      pageTitle: "Role List",
      breadcrumbs: [{ label: "Home", url: "/" }, { label: "Role List" }],
    });
  });
};

exports.apiGetAllRoles = (req, res) => {
  Role.findAll()
    .then((roles) => {
      res.json(roles);
    })
    .catch((err) => {
      console.error("Error fetching roles:", err);
      res.status(500).json({ error: "Failed to fetch roles." });
    });
};

// Show Create Role Form
exports.showCreateRoleForm = async (req, res) => {
  const adminId = req.session.adminId;

  try {
    const [results] = await sequelize.query(
      "SELECT * FROM admin WHERE id = ?",
      { replacements: [adminId] }
    );

    if (!results || results.length === 0) {
      return res.redirect("/login");
    }

    const admin = results[0];
    const imagePath = admin.image
      ? "/src/assets/image/uploads/" + admin.image
      : "/src/assets/image/uploads/profile-user.png";

    const successMessage = req.session.success;
    req.session.success = null;

    res.render("roleform", {
      role: null,
      error: null,
      name: admin.name,
      image: imagePath,
      roleId: admin.roleId, // ✅ added
      currentPage: "rolelist",
      success: successMessage,
      csrfToken: "",
      pageTitle: "Add Role",
      breadcrumbs: [
        { label: "Home", url: "/" },
        { label: "Role List", url: "/rolelist" },
        { label: "Add Role" },
      ],
    });
  } catch (err) {
    console.error("Error fetching admin:", err);
    res.redirect("/login");
  }
};

// Create Role
exports.createRole = async (req, res) => {
  const adminId = req.session.adminId;
  const { name, description, active } = req.body;
  const isActive = active === "on" ? true : false;

  async function renderWithError(errorMessage) {
    let admin = { name: "", image: "", roleId: 0 };
    try {
      const [results] = await sequelize.query(
        "SELECT * FROM admin WHERE id = ?",
        { replacements: [adminId] }
      );
      if (results && results.length > 0) {
        admin = results[0];
      }
    } catch (e) {
      console.error("Error fetching admin for sidebar:", e);
    }

    const imagePath = admin.image
      ? "/src/assets/image/uploads/" + admin.image
      : "/src/assets/image/uploads/profile-user.png";

    res.render("roleform", {
      role: null,
      error: errorMessage,
      name: admin.name,
      image: imagePath,
      roleId: admin.roleId || 0, // ✅ added
      currentPage: "rolelist",
      csrfToken: "",
      pageTitle: "Add Role",
      breadcrumbs: [
        { label: "Home", url: "/" },
        { label: "Role List", url: "/rolelist" },
        { label: "Add Role" },
      ],
    });
  }

  try {
    if (!name || name.trim() === "") {
      return renderWithError("Role name is required.");
    }

    const existingRole = await Role.findOne({
      where: { name: name.trim() },
    });

    if (existingRole) {
      return renderWithError("A role with this name already exists.");
    }

    await Role.create({
      name: name.trim(),
      description,
      active: isActive,
    });

    req.session.success = "✅ Role created successfully!";
    res.redirect("/rolelist");
  } catch (err) {
    console.error("Error creating role:", err);
    return renderWithError(
      "An unexpected error occurred while creating the role."
    );
  }
};

// Show Edit Role Form
exports.showEditRoleForm = async (req, res) => {
  const adminId = req.session.adminId;
  const roleIdParam = req.params.id;

  try {
    const [results] = await sequelize.query(
      "SELECT * FROM admin WHERE id = ?",
      { replacements: [adminId] }
    );

    if (!results || results.length === 0) {
      return res.redirect("/login");
    }

    const admin = results[0];
    const imagePath = admin.image
      ? "/src/assets/image/uploads/" + admin.image
      : "/src/assets/image/uploads/profile-user.png";

    const role = await Role.findByPk(roleIdParam);

    if (!role) {
      req.session.success = "Role not found.";
      return res.redirect("/rolelist");
    }

    res.render("roleform", {
      role,
      error: null,
      name: admin.name,
      image: imagePath,
      roleId: admin.roleId, // ✅ added
      currentPage: "rolelist",
      success: null,
      csrfToken: "",
      pageTitle: "Edit Role",
      breadcrumbs: [
        { label: "Home", url: "/" },
        { label: "Role List", url: "/rolelist" },
        { label: "Edit Role" },
      ],
    });
  } catch (err) {
    console.error("Error fetching edit role:", err);
    res.redirect("/rolelist");
  }
};

// Update Role
exports.updateRole = async (req, res) => {
  const roleId = req.params.id;
  const { name, description, active } = req.body;
  const isActive = active === "on" ? true : false;

  try {
    const role = await Role.findByPk(roleId);
    if (!role) {
      req.session.success = "Role not found.";
      return res.redirect("/rolelist");
    }

    // Check uniqueness if name changed
    if (role.name !== name.trim()) {
      const existingRole = await Role.findOne({ where: { name: name.trim() } });
      if (existingRole) {
        req.session.success = "A role with this name already exists.";
        return res.redirect("/rolelist");
      }
    }

    await role.update({
      name: name.trim(),
      description,
      active: isActive,
    });

    req.session.success = "✅ Role updated successfully!";
    res.redirect("/rolelist");
  } catch (err) {
    console.error("Error updating role:", err);
    req.session.success = "❌ An error occurred while updating the role.";
    res.redirect("/rolelist");
  }
};

// Delete Role
exports.deleteRole = async (req, res) => {
  const roleId = req.params.id;

  try {
    const role = await Role.findByPk(roleId);

    if (!role) {
      req.session.success = "Role not found.";
      return res.redirect("/rolelist");
    }

    await role.destroy();

    req.session.success = "✅ Role deleted successfully!";
    res.redirect("/rolelist");
  } catch (err) {
    console.error("Error deleting role:", err);
    req.session.success = "❌ An error occurred while deleting the role.";
    res.redirect("/rolelist");
  }
};
