const pool = require("../../models/db");

async function countLikeService(target_id) {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) FROM likes WHERE target_id = $1`,
      [target_id]
    );
    return { success: true, result };
  } catch (err) {
    throw err;
  }
}

module.exports = { countLikeService };
