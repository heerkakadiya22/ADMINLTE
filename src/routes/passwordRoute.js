const express = require("express");
const router = express.Router();
const passwordController = require("../controllers/passwordController");
const {
  forgotPasswordValidation,
  resetPasswordValidation,
  changePasswordValidation,
} = require("../validators/authValidator");
const { validationResult } = require("express-validator");
const csrf = require("csurf");
const csrfProtection = csrf();

const validator = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render(
      req.path.includes("reset-password")
        ? "reset-password"
        : "forgot-password",
      {
        error: errors.array()[0].msg,
        csrfToken: req.csrfToken(),
      }
    );
  }
  next();
};

const validation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("change-password", {
      error: errors.array()[0].msg,
      csrfToken: req.csrfToken(),
    });
  }
  next();
};

router.get("/forgot-password", passwordController.showForgotPassword);
router.post(
  "/forgot-password",
  csrfProtection,
  forgotPasswordValidation,
  validator,
  passwordController.forgotPassword
);
router.get(
  "/reset-password",
  csrfProtection,
  passwordController.showResetPassword
);
router.post(
  "/reset-password",
  csrfProtection,
  resetPasswordValidation,
  validator,
  passwordController.resetPassword
);

//change password route
router.get(
  "/change-password",
  csrfProtection,
  passwordController.showChangePassword
);
router.post(
  "/change-password",
  csrfProtection,
  changePasswordValidation,
  validation,
  passwordController.changePassword
);

module.exports = router;
