const express = require("express");
const CONFIG = require("./src/config/config");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const path = require("path");

const authRoutes = require("./src/routes/authRoute");
const dashboardRoutes = require("./src/routes/dashboardRoute");
const passwordRoutes = require("./src/routes/passwordRoute");
const profileRoutes = require("./src/routes/profileRoute");
const roleRoutes = require("./src/routes/rolesRoute");
const manageUserRoutes = require("./src/routes/manageUserRoute");

const { preventback } = require("./src/middleware/authMiddleware");

const app = express();
const { PORT, HOST } = CONFIG;

// View engine
app.set("view engine", "ejs");
app.set("views", "./src/views");

// Static
app.use("/src", express.static(path.join(__dirname, "src")));
app.use(express.static(path.join(__dirname, "public")));

app.set("views", [
  path.join(__dirname, "src/views"),
  path.join(__dirname, "src/views/account"),
  path.join(__dirname, "src/views/auth"),
  path.join(__dirname, "src/views/manageuser"),
  path.join(__dirname, "src/views/roles"),
]);
app.set("view engine", "ejs");

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
app.use(manageUserRoutes);
app.use(roleRoutes);

// Start
app.listen(PORT, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
