const pool = require("../../models/db");

async function cancleLikeController(like_id) {
  try {
    await pool.query(`DELETE FROM likes WHERE like_id = $1`, [like_id]);
    return { success: true };
  } catch (err) {
    throw err;
  }
}

module.exports = { cancleLikeController };
