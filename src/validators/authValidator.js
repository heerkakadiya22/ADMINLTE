const { body } = require("express-validator");

exports.reValidation = [
  body(["name", "email", "password", "confirmPassword"])
    .notEmpty()
    .withMessage("All field are required"),
  body("name")
    .matches(/^[A-Za-z ]+$/)
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

exports.changePasswordValidation = [
  body(["currentPassword", "newPassword", "confirmNewPassword"])
    .notEmpty()
    .withMessage("All fields are required"),
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6, max: 10 })
    .withMessage("New password must be at least 6, max 10 char.")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/)
    .withMessage(
      "New password must include upper, lower, number & special char"
    ),
  body("confirmNewPassword")
    .notEmpty()
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
];

exports.addUserValidation = [
  // Name
  body("name")
    .notEmpty()
    .matches(/^[A-Za-z ]+$/)
    .withMessage("Name must contain only letter"),

  // Email
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),

  // Phone
  // body("phone")
  //   .optional()
  //   .matches(/^\d{10}$/)
  //   .withMessage("Phone number must be 10 digits"),

  // Username
  // body("username")
  //   .optional()
  //   .isLength({ min: 4 })
  //   .withMessage("Username must be at least 4 characters"),

  // Address (optional)
  body("address")
    .optional()
    .isLength({ max: 200 })
    .withMessage("Address must be less than 200 characters"),

  // DOB
  // body("dob").optional().isISO8601().withMessage("Invalid date format"),

  // Gender
  body("gender")
    .optional()
    .isIn(["Male", "Female"])
    .withMessage("Gender must be Male or Female"),

  // Hobby
  body("hobby").optional(),

  // Password
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6, max: 10 })
    .withMessage("Password must be between 6 and 10 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage(
      "Password must include uppercase, lowercase, number, and special character"
    ),

  // Confirm Password
  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm Password is required")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
];
