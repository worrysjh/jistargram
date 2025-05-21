const { Pool } = require("pg");
require("dotenv").config();

// postgreSQL 연결 풀 만들기
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

//연결 확인 (에러 있으면 경고 처리)
pool
  .connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch((err) => console.log("PostgreSQL connection error", err));

module.exports = pool;
