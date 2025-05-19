const pool = require("../../models/db");
const bcrypt = require("bcrypt");

async function registerUser({
  user_name,
  nick_name,
  email,
  passwd,
  birthdate,
  gender,
}) {
  try {
    // 중복 id 검사
    const idCheck = await pool.query(
      `SELECT user_name FROM users WHERE user_name = $1`,
      [user_name]
    );
    if (idCheck.rows.length > 0) {
      return { success: false, messgae: "이미 사용중인 아이디입니다." };
    }

    // 중복 email 검사
    const emailCheck = await pool.query(
      `SELECT email FROM users WHERE email = $1`,
      [email]
    );
    if (emailCheck.rows.length > 0) {
      return { success: false, message: "이미 사용 중인 이메일입니다." };
    }

    // 패스워드 해싱
    const hashedPasswd = await bcrypt.hash(passwd, 10);

    await pool.query(
      `INSERT INTO users (user_name, nick_name, email, passwd, birthdate, gender) values ($1, $2, $3, $4, $5, $6)`,
      [user_name, nick_name, email, hashedPasswd, birthdate, gender]
    );

    return { success: true };
  } catch (err) {
    throw err;
  }
}

module.exports = { registerUser };
