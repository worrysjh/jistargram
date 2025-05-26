const pool = require("../models/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { encryptData } = require("../utils/cryptoUtils");

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
    success: true,
    access_token,
    refresh_token,
  };
}

// 회원가입입
async function registerUser({
  user_name,
  nick_name,
  email,
  passwd,
  birthdate,
  gender,
}) {
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
}

// 프로필 정보 불러오기
async function getProfileService(user_id) {
  const result = await pool.query(`SELECT * FROM users WHERE user_id = $1`, [
    user_id,
  ]);
  if (result.rows.length === 0) {
    return { success: false, message: "유저를 찾을 수 없음" };
  }

  return { success: true, result: result.rows[0] };
}

// 프로필 사진 업데이트트
async function updateMyImgService({ user_name, filename }) {
  const imagePath = `/uploads/profile_imgs/${filename}`;
  // 기존 이미지 삭제
  const result = await pool.query(
    `SELECT profile_img FROM users WHERE user_name = $1`,
    [user_name]
  );
  const oldImage = result.rows[0]?.profile_img;

  if (oldImage && oldImage !== "/common/img/사용자이미지.jpeg") {
    const oldImagePath = path.join(__dirname, "..", "public", oldImage);
    fs.unlink(oldImagePath, (err) => {
      if (err) {
        return {
          success: false,
          message: "기존 이미지 삭제 실패 또는 존재하지 않음: ",
        };
      } else {
        return {
          success: false,
          message: `기존 이미지 삭제 성공: ${oldImagePath}`,
        };
      }
    });
  }

  // DB 업데이트
  await pool.query(`UPDATE users SET profile_img = $1 WHERE user_name = $2`, [
    imagePath,
    user_name,
  ]);

  return { success: true };
}

// 자기소개 업데이트
async function updateMyBioService({ biography, user_name }) {
  await pool.query(`UPDATE users SET biography = $1 WHERE user_name = $2`, [
    biography,
    user_name,
  ]);

  return { success: true };
}

// 사용자 탈퇴 상태처리
async function changeStateService(user_id) {
  await pool.query(
    `UPDATE users SET user_state = '비활성' WHERE user_id = $1`,
    [user_id]
  );

  return { success: true };
}

module.exports = {
  loginService,
  registerUser,
  getProfileService,
  updateMyImgService,
  updateMyBioService,
  changeStateService,
};
