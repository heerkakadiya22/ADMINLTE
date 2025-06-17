const express = require("express");
const CONFIG = require("./src/config/config");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const path = require("path");
const csrf = require("csurf");

const authRoutes = require("./src/routes/authRoute");
const dashboardRoutes = require("./src/routes/dashboardRoute");
const passwordRoutes = require("./src/routes/passwordRoute");
const { preventback } = require("./src/middleware/authMiddleware");

const { PORT, HOST } = CONFIG;
const app = express();

// View engine setup
app.set("view engine", "ejs");
app.set("views", "./src/views");

// Static files
app.use("/src", express.static(path.join(__dirname, "src")));
app.use(express.static(path.join(__dirname, "public")));

// Session setup
const fileStoreOptions = { path: "./sessions" };

app.use(
  session({
    secret: CONFIG.SECRET_KEY,
    store: new FileStore(fileStoreOptions),
    resave: false,
    saveUninitialized: false,
  })
);

// Body parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// CSRF middleware
app.use(csrf());

// Make csrfToken to all views
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

// Custom middleware
app.use(preventback);

// Routes
app.use(authRoutes);
app.use(dashboardRoutes);
app.use(passwordRoutes);

// Server start
app.listen(PORT, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
