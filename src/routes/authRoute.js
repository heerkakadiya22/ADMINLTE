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

router.use(csrf());

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

module.exports = router;
