const pool = require("../../models/db");

async function deleteCommentService(comment_id) {
  try {
    await pool.query(
      `UPDATE comments SET comment_state = '삭제' WHERE comment_id = $1`,
      [comment_id]
    );
    return { success: true };
  } catch (err) {
    throw err;
  }
}

module.exports = { deleteCommentService };
