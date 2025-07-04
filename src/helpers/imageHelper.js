const path = require("path");

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
};
