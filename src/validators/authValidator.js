const { body } = require("express-validator");

exports.reValidation = [
  body(["name", "email", "password", "confirmPassword"])
    .notEmpty()
    .withMessage("All field are required"),
  body("name")
    .matches(/^[a-zA-Z]+$/)
    .withMessage("Name must contain only letters"),
  body("email").isEmail().withMessage("Invalid email format"),
  body("password")
    .isLength({ min: 6, max: 10 })
    .withMessage("Password must be at least 6, max 10 char.")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/)
    .withMessage("Password must include upper, lower, number & special char"),
  body("confirmPassword")
    .notEmpty()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
];

exports.loginValidation = [
  body(["email", "password"]).notEmpty().withMessage("All field are required"),
  body("email").isEmail().withMessage("Invalid email format"),
  body("password").notEmpty().withMessage("Password is required."),
];

exports.forgotPasswordValidation = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),
];

exports.resetPasswordValidation = [
  body("newPassword")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6, max: 10 })
    .withMessage("Password must be at least 6, max 10 char.")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/)
    .withMessage("Password must include upper, lower, number & special char"),
  body("confirmNewPassword")
    .notEmpty()
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
];
