const pool = require("../../models/db");

async function uploadService({ userid, content, media_url }) {
  try {
    await pool.query(
      "INSERT INTO posts (userid, content, media_url) values($1, $2, $3)",
      [userid, content, media_url]
    );

    return { success: true };
  } catch (err) {
    throw err;
  }
}

module.exports = { uploadService };
