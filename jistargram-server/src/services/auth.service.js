const pool = require("../models/db");
const { encryptData } = require("../utils/cryptoUtils");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const redisClient = require("../config/redis");
const nodemailer = require("nodemailer");

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
  return result;
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendVerificationService(email) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  try {
    await redisClient.set(`verify:${email}`, code, {
      EX: 300,
    });

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail({
        from: `"Jistargram" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "[Jistargram] 이메일 인증 번호입니다.",
        text: `인증 번호: ${code} (5분 이내에 입력해주세요)`,
      });
    } else {
      console.warn("EMAIL_USER 또는 EMAIL_PASS 환경변수가 설정되지 않았습니다.");
      console.log(`[DEV ONLY] 이메일(${email}) 인증번호: [ ${code} ]`);
    }

    return { success: true };
  } catch (err) {
    console.error("Verification code storage/send error:", err);
    throw err;
  }
}

async function verifyCodeService(email, code) {
  try {
    // Redis에서 해당 이메일의 코드 조회
    const savedCode = await redisClient.get(`verify:${email}`);

    if (!savedCode) {
      return { success: false, message: "인증번호가 만료되었거나 존재하지 않습니다." };
    }

    if (savedCode !== code) {
      return { success: false, message: "인증번호가 일치하지 않습니다." };
    }

    // 인증 성공 시 Redis에서 삭제
    await redisClient.del(`verify:${email}`);

    return { success: true };
  } catch (err) {
    console.error("Verification check error:", err);
    throw err;
  }
}

async function resetPasswordService(email, newPassword) {
  try {
    const saltRounds = 10;
    const hashedPasswd = await bcrypt.hash(newPassword, saltRounds);
    
    const result = await pool.query(
      `UPDATE users SET passwd = $1 WHERE email = $2`,
      [hashedPasswd, email]
    );

    if (result.rowCount === 0) {
      return { success: false, message: "사용자를 찾을 수 없습니다." };
    }

    return { success: true };
  } catch (err) {
    console.error("Password reset error:", err);
    throw err;
  }
}

module.exports = {
  loginService,
  getRefreshToken,
  sendVerificationService,
  verifyCodeService,
  resetPasswordService,
};
