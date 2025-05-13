const pool = require("../../models/db");

async function updateMyBioService({ biography, username }) {
  try {
    await pool.query("UPDATE users SET biography = $1 WHERE username = $2", [
      biography,
      username,
    ]);

    return { success: true };
  } catch (err) {
    throw err;
  }
}

module.exports = { updateMyBioService };
