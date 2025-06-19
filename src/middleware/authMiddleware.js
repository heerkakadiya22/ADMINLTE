const multer = require("multer");
const path = require("path");

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../assets/image/uploads");
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Create the multer instance
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(ext)) {
      cb(null, true);
    } else {
      cb("Only images allowed");
    }
  },
});

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
  upload,
};
