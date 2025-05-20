const pool = require("../models/db");

async function getRefreshToken(user_id, token) {
  const result = await pool.query(
    `SELECT * FROM refresh_tokens WHERE payload = $1 AND payload = $2`,
    [user_id, token]
  );
  return { result };
}

module.exports = { getRefreshToken };
