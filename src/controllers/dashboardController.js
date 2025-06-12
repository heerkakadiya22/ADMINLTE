exports.dashboard = (req, res) => {
  res.render("index", {
    name: req.session.name,
    email: req.session.email,
    csrfToken: req.csrfToken(),
  });
};
