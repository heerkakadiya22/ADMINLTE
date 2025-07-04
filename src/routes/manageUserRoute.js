const express = require("express");
const router = express.Router();
const { upload } = require("../middleware/authMiddleware");
const csrf = require("csurf");
const csrfProtection = csrf();
const manageuserController = require("../controllers/manageuserController");
const { addUserValidation } = require("../validators/authValidator");
const { validationResult } = require("express-validator");

const Validation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("adduser", {
      error: errors.array()[0].msg,
      name: req.session.adminName,
      image:
        req.session.adminImage || "/src/assets/image/uploads/profile-user.png",
      csrfToken: "",
      currentPage: "manageuser",
    });
  }
  next();
};

router.get("/manageuser", csrfProtection, manageuserController.getAllUser);
router.get("/api/users", manageuserController.apiGetAllUsers);

router.get("/adduser", csrfProtection, manageuserController.showAddUser);
router.post(
  "/adduser",
  upload.single("image"),
  addUserValidation,
  Validation,
  manageuserController.addUser
);

router.delete("/deleteuser/:id", manageuserController.deleteUser);

router.get("/edituser/:id", csrfProtection, manageuserController.showEditUser);
router.post(
  "/edituser",
  upload.single("image"),
  manageuserController.updateUser
);

module.exports = router;
