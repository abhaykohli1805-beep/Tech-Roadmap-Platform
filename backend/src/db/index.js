require("dotenv").config();

const { Pool } = require("pg");
console.log("DB_PASSWORD TYPE:", typeof process.env.DB_PASSWORD);

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, // MUST BE STRING
  database: process.env.DB_NAME,
});

module.exports = pool;
