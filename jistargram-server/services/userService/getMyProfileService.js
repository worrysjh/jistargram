const pool = require("../../models/db");

async function getMyProfileService(user_name) {
  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE user_name = $1",
      [user_name]
    );

    if (result.rows.length === 0) {
      return { success: false, message: "유저를 찾을 수 없음" };
    }

    return { success: true, result: result.rows[0] };
  } catch (err) {
    throw err;
  }
}

module.exports = { getMyProfileService };
