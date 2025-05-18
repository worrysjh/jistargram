const pool = require("../../models/db");

async function updateCommentService(comment_id, comment_content) {
  try {
    await pool.query(
      `UPDATE comments SET comment_content = $1 WHERE comment_id = $2`,
      [comment_content, comment_id]
    );
    return { success: true };
  } catch (err) {
    throw err;
  }
}

module.exports = { updateCommentService };
