const express = require("express");
const CONFIG = require("./src/config/config");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const path = require("path");

const authRoutes = require("./src/routes/authRoute");
const dashboardRoutes = require("./src/routes/dashboardRoute");
const passwordRoutes = require("./src/routes/passwordRoute");
const profileRoutes = require("./src/routes/profileRoute");
const roleRoutes = require("./src/routes/rolesRoutes");

const { preventback } = require("./src/middleware/authMiddleware");

const app = express();
const { PORT, HOST } = CONFIG;

// View engine
app.set("view engine", "ejs");
app.set("views", "./src/views");

// Static
app.use("/src", express.static(path.join(__dirname, "src")));
app.use(express.static(path.join(__dirname, "public")));

// Session
app.use(
  session({
    secret: CONFIG.SECRET_KEY,
    store: new FileStore({ path: "./sessions" }),
    resave: false,
    saveUninitialized: false,
  })
);

// Body parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Custom middleware
app.use(preventback);

// Routes
app.use(authRoutes);
app.use(dashboardRoutes);
app.use(passwordRoutes);
app.use(profileRoutes);
app.use(roleRoutes);

// Start
app.listen(PORT, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
