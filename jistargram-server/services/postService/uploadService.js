const pool = require("../../models/db");

async function uploadService({ user_id, content, media_url }) {
  try {
    await pool.query(
      `INSERT INTO posts (user_id, content, media_url) values($1, $2, $3)`,
      [user_id, content, media_url]
    );

    return { success: true };
  } catch (err) {
    throw err;
  }
}

module.exports = { uploadService };
