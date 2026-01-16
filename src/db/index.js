const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
console.log("DB PASSWORD TYPE:", typeof process.env.DB_PASSWORD);

pool.on("connect", () => {
  console.log("✅ Connected to PostgreSQL");
});

module.exports = pool;
