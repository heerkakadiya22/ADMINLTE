const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const {
  reValidation,
  loginValidation,
} = require("../validators/authValidator");
const { validationResult } = require("express-validator");
const { preventbackprotect, protect } = require("../middleware/authMiddleware");
const csrf = require("csurf");
const csrfProtection = csrf();

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
router.get(
  "/register",
  csrfProtection,
  preventbackprotect,
  authController.showregister
);
router.get(
  "/login",
  csrfProtection,
  preventbackprotect,
  authController.getlogin
);
router.post(
  "/register",
  csrfProtection,
  reValidation,
  ValidationErr,
  authController.register
);
router.post(
  "/login",
  csrfProtection,
  loginValidation,
  ValidationErr,
  authController.login
);
router.post("/logout", csrfProtection, protect, authController.logout);

module.exports = router;
