const db = require("../config/db");

//forgot password controller
exports.showForgotPassword = (req, res) => {
  res.render("forgot-password", { csrfToken: req.csrfToken() });
};

exports.forgotPassword = (req, res) => {
  const { email } = req.body;

  const sql = "SELECT * FROM admin WHERE email = ?";
  db.query(sql, [email], (err, result) => {
    if (err || result.length === 0) {
      return res.render("forgot-password", {
        error: "Email not found.",
        csrfToken: req.csrfToken(),
      });
    }

    req.session.resetEmail = email;
    req.session.save((err) => {
      if (err) {
        return res.render("forgot-password", {
          error: "Session error. Try again.",
          csrfToken: req.csrfToken(),
        });
      }
      res.redirect("/reset-password");
    });
  });
};

// Reset password controller
exports.showResetPassword = (req, res) => {
  if (!req.session.resetEmail) {
    return res.redirect("/forgot-password");
  }
  res.render("reset-password", { csrfToken: req.csrfToken() });
};

exports.resetPassword = (req, res) => {
  const { newPassword, confirmNewPassword } = req.body;
  const email = req.session.resetEmail;

  if (!email) {
    return res.redirect("/forgot-password");
  }

  if (!newPassword || !confirmNewPassword) {
    return res.render("reset-password", {
      error: "Both password fields are required.",
      csrfToken: req.csrfToken(),
    });
  }

  if (newPassword !== confirmNewPassword) {
    return res.render("reset-password", {
      error: "Passwords do not match.",
      csrfToken: req.csrfToken(),
    });
  }

  const sql =
    "UPDATE admin SET password = ?, confirm_password = ? WHERE email = ?";
  db.query(sql, [newPassword, confirmNewPassword, email], (err, result) => {
    if (err || result.affectedRows === 0) {
      return res.render("reset-password", {
        error: "Error resetting password. Please try again.",
        csrfToken: req.csrfToken(),
      });
    }

    req.session.resetEmail = null;
    res.redirect("/login");
  });
};
