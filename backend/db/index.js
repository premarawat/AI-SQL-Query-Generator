const { Pool } = require("pg");
require("dotenv").config();

const isNeon = process.env.DB_HOST?.includes("neon.tech");

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "ai_sql_assistant",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "prema",

  ssl: isNeon
    ? {
        rejectUnauthorized: false,
      }
    : false,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};