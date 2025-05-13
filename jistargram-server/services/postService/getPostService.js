const pool = require("../../models/db");

async function getPostService() {
  try {
    const result = await pool.query(
      "SELECT posts.content, posts.media_url, users.username, users.profile_img FROM posts JOIN users ON posts.userid = users.userid ORDER BY posts.created_at DESC"
    );
    return { success: true, result: result.rows };
  } catch (err) {
    throw err;
  }
}

module.exports = { getPostService };
