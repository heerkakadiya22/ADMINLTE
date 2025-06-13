const express = require("express");
const router = express.Router();
const authController = require("../controllers/passwordController");
const {
  forgotPasswordValidation,
  resetPasswordValidation,
} = require("../validators/authValidator");
const { validationResult } = require("express-validator");

const csrf = require("csurf");

router.use(csrf());

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

router.get("/forgot-password", authController.showForgotPassword);
router.post(
  "/forgot-password",
  forgotPasswordValidation,
  validator,
  authController.forgotPassword
);
router.get("/reset-password", authController.showResetPassword);
router.post(
  "/reset-password",
  resetPasswordValidation,
  validator,
  authController.resetPassword
);

module.exports = router;
