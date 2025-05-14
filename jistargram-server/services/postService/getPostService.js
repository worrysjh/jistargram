const pool = require("../../models/db");

async function getPostService() {
  try {
    const result = await pool.query(
      "SELECT posts.post_id, posts.content, posts.media_url, users.user_id, users.user_name, users.profile_img FROM posts JOIN users ON posts.user_id = users.user_id WHERE post_state ='공개' ORDER BY posts.created_at DESC"
    );
    return { success: true, result: result.rows };
  } catch (err) {
    throw err;
  }
}

module.exports = { getPostService };
