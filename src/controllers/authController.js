const db = require("../config/db");

//login controller
exports.showlogin = (req, res) => {
  res.redirect("/login");
};

//register controller
exports.showregister = (req, res) => {
  res.render("register", {
    csrfToken: req.csrfToken(),
  });
};

exports.register = (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  //if admin already exists
  const checkadmin = "SELECT * FROM admin WHERE email = ?";
  db.query(checkadmin, [email], (err, result) => {
    if (result.length > 0 || err) {
      return res.render("register", {
        error: "Email already registered",
        csrfToken: req.csrfToken(),
        name: name,
        email: email
      });
    }

    const sql =
      "INSERT INTO admin (name, email, password, confirm_password) VALUES (?, ?, ?, ?)";
    db.query(sql, [name, email, password, confirmPassword], (err, result) => {
      if (err) {
        return res.render("register", {
          error: "Error registering admin. Please try again.",
          csrfToken: req.csrfToken(),
          name: name,
          email: email
        });
      }
      res.redirect("/login");
    });
  });
};

//login controller
exports.getlogin = (req, res) => {
  const { authenticated } = req.session;

  if (authenticated) {
    return res.redirect("/index");
  } else {
    res.render("login", { csrfToken: req.csrfToken() });
  }
};

exports.login = (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM admin WHERE email=? AND BINARY password=?";

  db.query(sql, [email, password], (err, result) => {
    if (err || result.length === 0) {
      return res.render("login", {
        error: "Invalid email or password.",
        csrfToken: req.csrfToken(),
        email: email,
      });
    }

    req.session.authenticated = true;
    req.session.name = result[0].name;
    req.session.email = result[0].email;

    req.session.save((err) => {
      if (err) {
        return res.render("login", {
          error: "Session error. Try again.",
          csrfToken: req.csrfToken(),
          email: email,
        });
      }
      res.redirect("/index");
    });
  });
};

//logout controller
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Error logging out");
    } else {
      res.redirect("/login");
    }
  });
};
