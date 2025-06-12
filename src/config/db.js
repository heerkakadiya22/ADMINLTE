const mysql = require("mysql");
const CONFIG = require("./config");

const db = mysql.createConnection({
  host: CONFIG.HOST,
  user: CONFIG.USER,
  password: CONFIG.PASSWORD,
  database: CONFIG.DB_NAME,
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to the database");
});

module.exports = db;
