const express = require("express");
const CONFIG = require("./src/config/config");
const session = require("express-session");
var FileStore = require("session-file-store")(session);
const authRoutes = require("./src/routes/authRoute");
const path = require("path");
const dashboardRoutes = require("./src/routes/dashboardRoute");
const passwordRoutes = require("./src/routes/passwordRoute");
const { preventback } = require("./src/middleware/authMiddleware");
const { PORT, HOST } = CONFIG;

const app = express();

//view engine
app.set("view engine", "ejs");
app.set("views", "./src/views");

app.use("/src", express.static(path.join(__dirname, "src")));

//use session
var fileStoreOptions = {
  path: "./sessions",
};

app.use(
  session({
    secret: CONFIG.SECRET_KEY,
    store: new FileStore(fileStoreOptions),
    resave: false,
    saveUninitialized: false,
  })
);

//middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(preventback);
app.use(express.static(path.join(__dirname, "public")));
app.use(authRoutes);
app.use(dashboardRoutes);
app.use(passwordRoutes);

//server start
app.listen(PORT, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
