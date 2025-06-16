exports.dashboard = (req, res) => {
  return res.render("index", {
    name: req.session.name,
    email: req.session.email,
    csrfToken: req.csrfToken(),
  });
};
