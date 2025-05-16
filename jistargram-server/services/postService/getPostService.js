const pool = require("../../models/db");

async function getPostService() {
  try {
    const result = await pool.query(
      `SELECT
        p.post_id,
        p.content,
        p.media_url,
        p.created_at,
        u.user_id,
        u.user_name,
        u.profile_img,
        COUNT(c.comment_id) AS comment_count
      FROM posts p
      JOIN users u ON p.user_id = u.user_id
      LEFT JOIN comments c
        ON c.post_id = p.post_id AND c.comment_state = '생성'
      WHERE p.post_state = '공개'
      GROUP BY
        p.post_id, p.content, p.media_url, p.created_at,
        u.user_id, u.user_name, u.profile_img
      ORDER BY p.created_at DESC;
      `
    );
    return { success: true, result: result.rows };
  } catch (err) {
    throw err;
  }
}

module.exports = { getPostService };
