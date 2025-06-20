const db = require("../config/db");

exports.dashboard = (req, res) => {
  const id = req.session.adminId;

  const sql = "SELECT * FROM admin WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err || result.length === 0) {
      return res.render("index", {
        name: "",
        email: "",
        image: "/src/assets/image/uploads/profile-user.png",
        csrfToken: req.csrfToken(),
        error: "User not found",
      });
    }

    const user = result[0];
    const imagePath =
      "/src/assets/image/uploads/" + (user.image || "profile-user.png");

    res.render("index", {
      name: user.name,
      email: user.email,
      image: imagePath,
      csrfToken: req.csrfToken(),
    });
  });
};
