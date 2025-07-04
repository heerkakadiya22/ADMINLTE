module.exports = {
  /**
   * Format a date string or Date object to YYYY-MM-DD.
   * Returns "" if invalid or empty.
   * @param {string|Date|null|undefined} value
   * @returns {string}
   */
  formatDob(value) {
    if (!value) return "";

    const date = new Date(value);
    if (isNaN(date)) return "";

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`;
  },
};
