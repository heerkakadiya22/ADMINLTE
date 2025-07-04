const mysql = require("mysql");
const CONFIG = require("./config");

// Force parse DB_PORT as number, with fallback to 3306
const dbPort = CONFIG.DB_PORT ? parseInt(CONFIG.DB_PORT) : 3306;

// console.log("Connecting to MySQL on", CONFIG.HOST, "port", dbPort);

const db = mysql.createConnection({
  host: CONFIG.HOST,
  port: dbPort,
  user: CONFIG.USER,
  password: CONFIG.PASSWORD,
  database: CONFIG.DB_NAME,
  connectTimeout: 10000,
});

db.connect((err) => {
  if (err) {
    console.error("❌ MySQL CONNECTION FAILED:", err);
    process.exit(1);
  }
  console.log("✅ Connected to the database");
});

module.exports = db;
