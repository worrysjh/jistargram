const pool = require("../../models/db");

async function changeStateService(user_id) {
  try {
    await pool.query(
      "UPDATE users SET user_state = '비활성' WHERE user_id = $1",
      [user_id]
    );

    return { success: true };
  } catch (err) {
    throw err;
  }
}

module.exports = { changeStateService };
