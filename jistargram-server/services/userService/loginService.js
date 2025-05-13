const pool = require("../../models/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function loginService({ username, passwd }) {
  try {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    const user = result.rows[0];
    // id(username) 존재 여부 확인
    if (!user) {
      return { success: false, message: "잘못된 아이디 또는 비밀번호입니다." };
    }

    // passwd 해시값 비교
    const match = await bcrypt.compare(passwd, user.passwd);
    if (!match) {
      return { success: false, message: "잘못된 아이디 또는 비밀번호입니다." };
    }

    const token = jwt.sign(
      { userid: user.userid, username: user.username },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    return {
      success: true,
      token,
      user: {
        username: user.username,
        userid: user.userid,
      },
    };
  } catch (err) {
    throw err;
  }
}
module.exports = { loginService };
