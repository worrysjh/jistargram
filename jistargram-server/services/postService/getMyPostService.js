const pool = require("../../models/db");

async function getMyPostService(user_id) {
  try {
    const result = await pool.query(
      "SELECT p.post_id, p.content, p.media_url, u.user_name, u.profile_img FROM posts p JOIN users u ON p.user_id = u.user_id WHERE p.user_id = $1 ORDER BY p.created_at DESC",
      [user_id]
    );

    return { success: true, result: result.rows };
  } catch (err) {
    throw err;
  }
}

module.exports = { getMyPostService };
