//dashboard routes
const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");
const csrf = require("csurf");
const csrfProtection = csrf();

router.get("/index", csrfProtection, protect, dashboardController.dashboard);

module.exports = router;
