const pool = require("../../models/db");

async function countCommentService(post_id) {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) FROM comments WHERE post_id = $1`,
      [post_id]
    );
    return { success: true, result };
  } catch (err) {
    throw err;
  }
}

module.exports = { countCommentService };
