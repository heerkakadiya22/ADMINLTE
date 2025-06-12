//dashboard routes
const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");
const csrf = require("csurf");
router.use(csrf());

router.get("/index", protect, dashboardController.dashboard);

module.exports = router;
