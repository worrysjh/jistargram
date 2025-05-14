const pool = require("../../models/db");

async function updatePostService({ content, media_url, post_id }) {
  try {
    await pool.query(
      "UPDATE posts SET content = $1, media_url = $2 WHERE post_id = $3",
      [content, media_url, post_id]
    );

    return { success: true };
  } catch {
    throw err;
  }
}

module.exports = { updatePostService };
