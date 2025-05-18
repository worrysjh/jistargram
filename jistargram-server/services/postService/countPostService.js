const pool = require("../../models/db");

async function countPostService(user_id) {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) FROM posts
       WHERE user_id = $1 && post_state = '공개'`,
      [user_id]
    );
    return { success: true, result };
  } catch (err) {
    throw err;
  }
}

module.exports = { countPostService };
