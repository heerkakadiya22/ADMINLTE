const express = require("express");
const router = express.Router();
const roleController = require("../controllers/rolesController");
const csrf = require("csurf");
const csrfProtection = csrf();

router.get("/rolelist", csrfProtection, roleController.getAllRoles);
router.get("/api/getroles", roleController.apiGetAllRoles);
router.get("/addrole", csrfProtection, roleController.showCreateRoleForm);
router.post("/addrole", roleController.createRole);
router.get("/roles/:id/edit", csrfProtection, roleController.showEditRoleForm);
router.post("/roles/:id/edit", roleController.updateRole);
router.delete("/roles/:id/delete", roleController.deleteRole);

module.exports = router;
