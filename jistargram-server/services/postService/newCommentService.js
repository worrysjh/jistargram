const pool = require("../../models/db");

async function newCommentService({
  post_id,
  user_id,
  comment_content,
  parent_id,
}) {
  try {
    await pool.query(
      "INSERT INTO comments (post_id, user_id, comment_content, parent_id) VALUES ($1, $2, $3, $4)",
      [post_id, user_id, comment_content, parent_id]
    );
    return { success: true };
  } catch (err) {
    throw err;
  }
}

module.exports = { newCommentService };
