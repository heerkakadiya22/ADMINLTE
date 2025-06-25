const express = require("express");
const router = express.Router();
const { upload } = require("../middleware/authMiddleware");
const profileController = require("../controllers/profileController");
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
      success: null,
      name: req.session.name || "",
    });
  }
  next();
};

router.get("/editprofile", csrfProtection, profileController.showEditProfile);
router.post(
  "/editprofile",
  upload.single("image"),
  profileController.updateProfile
);

router.get("/manageuser", csrfProtection, manageuserController.getalluser);

router.get("/adduser", csrfProtection, manageuserController.showAddUser);
router.post(
  "/adduser",
  upload.single("image"),
  addUserValidation,
  Validation,
  manageuserController.insertUser
);

module.exports = router;
