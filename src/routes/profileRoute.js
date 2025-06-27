const express = require("express");
const router = express.Router();
const { upload } = require("../middleware/authMiddleware");
const profileController = require("../controllers/profileController");
const csrf = require("csurf");
const csrfProtection = csrf();
const manageuserController = require("../controllers/manageuserController");
const { addUserValidation } = require("../validators/authValidator");
const { validationResult } = require("express-validator");
const multer = require("multer");

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError || err.code === "INVALID_FILETYPE") {
    return res.render("editProfile", {
      name: req.body.name || "",
      email: req.body.email || "",
      username: req.body.username || "",
      address: req.body.address || "",
      dob: req.body.dob || "",
      gender: req.body.gender || "",
      phone: req.body.phone || "",
      hobby: Array.isArray(req.body.hobby)
        ? req.body.hobby
        : req.body.hobby
        ? [req.body.hobby]
        : [],
      image: req.session.image
        ? "/src/assets/image/uploads/" + req.session.image
        : "/src/assets/image/uploads/profile-user.png",
      error: err.message,
      success: null,
    });
  }
  next(err);
};

const Validation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("adduser", {
      error: errors.array()[0].msg,
      name: req.session.adminName,
      image:
        req.session.adminImage || "/src/assets/image/uploads/profile-user.png",
      csrfToken: "",
    });
  }
  next();
};

router.get("/editprofile", csrfProtection, profileController.showEditProfile);
router.post(
  "/editprofile",
  upload.single("image"),
  handleMulterError,
  profileController.updateProfile
);

router.get("/manageuser", csrfProtection, manageuserController.getalluser);

router.get("/adduser", csrfProtection, manageuserController.showadduser);
router.post(
  "/adduser",
  upload.single("image"),
  addUserValidation,
  Validation,
  manageuserController.insertuser
);

router.get("/deleteuser/:id", manageuserController.deleteUser);

module.exports = router;
