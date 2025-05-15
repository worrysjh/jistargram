const pool = require("../../models/db");

async function showAllCommentService(post_id) {
  try {
    const result = await pool.query(
      "SELECT comments.*, users.user_name FROM comments JOIN users ON comments.user_id = users.user_id WHERE post_id = $1 ORDER BY comments.created_at DESC",
      [post_id]
    );

    return { success: true, result: result.rows };
  } catch (err) {
    throw err;
  }
}

module.exports = { showAllCommentService };
