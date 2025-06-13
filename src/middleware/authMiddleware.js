const preventback = (req, res, next) => {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, private"
  );
  next();
};

const protect = (req, res, next) => {
  const { authenticated } = req.session;

  if (!authenticated) {
    return res.redirect("/login");
  } else {
    next();
  }
};

const preventbackprotect = (req, res, next) => {
  const { authenticated } = req.session;
  const isloggin = req.session.email && req.session.name;

  if (authenticated && isloggin) {
    return res.redirect("/index");
  } else {
    next();
  }
};



module.exports = {
  preventback,
  protect,
  preventbackprotect,
};
