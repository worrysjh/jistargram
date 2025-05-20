const pool = require("../../models/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function loginService({ user_name, passwd }) {
  try {
    const result = await pool.query(
      `SELECT * FROM users WHERE user_name = $1`,
      [user_name]
    );
    const user = result.rows[0];
    // id(user_name) 존재 여부 확인
    if (!user) {
      return { success: false, message: "잘못된 아이디 또는 비밀번호입니다." };
    }

    // passwd 해시값 비교
    const match = await bcrypt.compare(passwd, user.passwd);
    if (!match) {
      return { success: false, message: "잘못된 아이디 또는 비밀번호입니다." };
    }

    const access_token = jwt.sign(
      { user_id: user.user_id, user_name: user.user_name },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    return {
      success: true,
      access_token,
      user: {
        user_name: user.user_name,
        user_id: user.user_id,
      },
    };
  } catch (err) {
    throw err;
  }
}
module.exports = { loginService };
