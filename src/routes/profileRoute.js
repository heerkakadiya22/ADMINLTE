const express = require("express");
const router = express.Router();
const { upload } = require("../middleware/authMiddleware");
const profileController = require("../controllers/profileController");

router.get("/editprofile", profileController.showEditProfile);
router.post(
  "/editprofile",
  upload.single("image"),
  profileController.updateProfile
);

module.exports = router;
