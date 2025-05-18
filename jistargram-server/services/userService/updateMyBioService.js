const pool = require("../../models/db");

async function updateMyBioService({ biography, user_name }) {
  try {
    await pool.query(`UPDATE users SET biography = $1 WHERE user_name = $2`, [
      biography,
      user_name,
    ]);

    return { success: true };
  } catch (err) {
    throw err;
  }
}

module.exports = { updateMyBioService };
