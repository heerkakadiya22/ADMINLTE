const multer = require("multer");
const path = require("path");

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../assets/image/uploads");
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Updated file filter with mimetype check
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      const error = new Error("Only images allowed (jpeg, jpg, png, gif)");
      error.code = "INVALID_FILETYPE";
      return cb(error);
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
