const pool = require("../../models/db");

async function closePostService(post_id) {
  try {
    await pool.query("UPDATE posts SET post_state='삭제' WHERE post_id = $1", [
      post_id,
    ]);
    return { success: true };
  } catch (err) {
    throw err;
  }
}

module.exports = { closePostService };
