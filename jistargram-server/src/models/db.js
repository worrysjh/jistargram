const { Pool } = require("pg");
require("dotenv").config();

// postgreSQL 연결 풀 만들기
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
console.log("🔍 DB_PASSWORD = ", process.env.DB_PASSWORD);
console.log("🔍 typeof DB_PASSWORD =", typeof process.env.DB_PASSWORD);
//연결 확인 (에러 있으면 경고 처리)
pool
  .connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch((err) => console.log("PostgreSQL connection error", err));

module.exports = pool;
