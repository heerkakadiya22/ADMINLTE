const express = require("express");
const router = express.Router();
const { upload } = require("../middleware/authMiddleware");
const profileController = require("../controllers/profileController");
const csrf = require("csurf");
const csrfProtection = csrf();

router.get("/editprofile", csrfProtection, profileController.showEditProfile);
router.post(
  "/editprofile",
  upload.single("image"),
  profileController.updateProfile
);

module.exports = router;
