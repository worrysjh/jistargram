const pool = require("../models/db");
const { encryptData } = require("../utils/cryptoUtils");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// 로그인
async function loginService({ user_name, passwd }) {
  const result = await pool.query(`SELECT * FROM users WHERE user_name = $1`, [
    user_name,
  ]);
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

  const { data, iv, tag } = encryptData({
    user_id: user.user_id,
    user_name: user.user_name,
  });

  const access_token = jwt.sign({ data, iv, tag }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  const refresh_token = jwt.sign(
    { data, iv, tag, type: "refresh" },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  const decoded = jwt.decode(refresh_token);
  const expires_at = new Date(decoded.exp * 1000);

  await pool.query(
    `
      INSERT INTO refresh_tokens (user_id, payload, expires_at)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id) DO UPDATE SET payload = $2, expires_at = $3`,
    [user.user_id, refresh_token, expires_at]
  );

  return {
    user_id: user.user_id,
    success: true,
    access_token,
    refresh_token,
  };
}

async function getRefreshToken(user_id, token) {
  const result = await pool.query(
    `SELECT * FROM refresh_tokens WHERE user_id = $1 AND payload = $2`,
    [user_id, token]
  );
  return { result };
}

module.exports = { loginService, getRefreshToken };
