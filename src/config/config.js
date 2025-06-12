require("dotenv").config();

const CONFIG = {
  PORT: process.env.PORT,
  HOST: process.env.HOST,
  USER: process.env.USER,
  PASSWORD: process.env.PASSWORD,
  DB_NAME: process.env.DB_NAME,
  SECRET_KEY: process.env.SECRET_KEY,
};

module.exports = CONFIG;
