const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const {
  reValidation,
  loginValidation,
} = require("../validators/authValidator");
const { validationResult } = require("express-validator");
const {
  preventbackprotect,
  protect,
  upload,
} = require("../middleware/authMiddleware");
const profileController = require("../controllers/profileController");

const ValidationErr = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render(req.path.includes("login") ? "login" : "register", {
      error: errors.array()[0].msg,
      csrfToken: req.csrfToken(),
    });
  }
  next();
};

router.get("/", authController.showlogin);
router.get("/register", preventbackprotect, authController.showregister);
router.get("/login", preventbackprotect, authController.getlogin);
router.post("/register", reValidation, ValidationErr, authController.register);
router.post("/login", loginValidation, ValidationErr, authController.login);
router.post("/logout", protect, authController.logout);

router.get("/editProfile", profileController.showEditProfile);
router.post(
  "/editProfile",
  upload.single("image"),
  profileController.updateProfile
);

module.exports = router;
