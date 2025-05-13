const pool = require("../../models/db");

async function changeStateService(userid) {
  try {
    await pool.query(
      "UPDATE users SET user_state = '비활성' WHERE userid = $1",
      [userid]
    );

    return { success: true };
  } catch (err) {
    throw err;
  }
}

module.exports = { changeStateService };
