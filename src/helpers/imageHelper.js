const path = require("path");
const fs = require("fs");

const UPLOADS_DIR = "/src/assets/image/uploads";
const UPLOADS_ABSOLUTE = path.join(__dirname, "../assets/image/uploads");
const DEFAULT_IMAGE = "profile-user.png";

module.exports = {
  /**
   * Return the public URL for displaying images in views
   */
  getImageUrl(filename) {
    return `${UPLOADS_DIR}/${filename || DEFAULT_IMAGE}`;
  },

  /**
   * Return the absolute path on disk
   */
  getImagePath(filename) {
    return path.join(UPLOADS_ABSOLUTE, filename || DEFAULT_IMAGE);
  },

  /**
   * Return default image filename
   */
  getDefaultImage() {
    return DEFAULT_IMAGE;
  },

  /**
   * Check if filename is default image
   */
  isDefaultImage(filename) {
    return filename === DEFAULT_IMAGE;
  },

  /**
   * Delete image from disk if not default
   */
  deleteImage(filename) {
    if (!filename || this.isDefaultImage(filename)) return;

    const filePath = this.getImagePath(filename);
    fs.unlink(filePath, (err) => {
      if (err && err.code !== "ENOENT") {
        console.error("Failed to delete image:", err);
      }
    });
  },

  /**
   * Get filename or fallback to default
   */
  saveImage(file) {
    return file ? file.filename : DEFAULT_IMAGE;
  },

  /**
   * Return relative path (without /src) for API usage
   */
  getRelativePath(filename) {
    return `/assets/image/uploads/${filename || DEFAULT_IMAGE}`;
  },
};
