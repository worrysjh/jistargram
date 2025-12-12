const pool = require("../models/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { encryptData } = require("../utils/cryptoUtils");
const path = require("path");
const fs = require("fs");

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

// 회원가입
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
    return { success: false, message: "이미 사용중인 아이디입니다." };
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
  const result = await pool.query(
    `SELECT
      u.user_id,
      u.user_name,
      u.nick_name,
      u.email,
      u.birthdate,
      u.gender,
      u.created_at,
      u.biography,
      u.profile_img,
      (
        SELECT COUNT(*)
        FROM followers f
        WHERE f.following_id = u.user_id
      ) AS follower_count,
      (
        SELECT COUNT(*)
        FROM followers f
        WHERE f.follower_id = u.user_id
      ) AS following_count
    FROM users u
    WHERE u.user_id = $1`,
    [user_id]
  );
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

async function getAllUserInfo(keyword = "", my_id = null) {
  console.log("getAllUserInfo 호출:", { keyword, my_id });

  const params = [];
  // $1 = my_id (nullable), $2 = keyword (if provided)
  let query = `
    SELECT 
      u.user_id AS "user_id", 
      u.user_name AS "user_name", 
      u.nick_name AS "nick_name", 
      u.profile_img AS "profile_img", 
      u.biography AS "biography",
      CASE WHEN f.follower_id IS NOT NULL THEN true ELSE false END AS "isFollowing"
    FROM users u
    LEFT JOIN followers f ON u.user_id = f.following_id AND f.follower_id = $1
    WHERE u.user_state = '활성' AND u.user_id != $1
  `;

  // param 1: my_id (may be null)
  params.push(my_id);

  // 검색 키워드가 있으면 추가
  if (keyword) {
    params.push(`%${keyword}%`);
    query += ` AND (u.user_name ILIKE $${params.length} OR u.nick_name ILIKE $${params.length})`;
  }

  query += ` ORDER BY u.user_name`;

  console.log("실행 쿼리:", query);
  console.log("파라미터:", params);

  try {
    const result = await pool.query(query, params);
    console.log("조회된 사용자 수:", result.rows.length);
    return result.rows;
  } catch (err) {
    console.error("getAllUserInfo DB error:", err);
    throw err;
  }
}

async function addFollowUser(my_id, target_id) {
  const result = await pool.query(
    `INSERT INTO followers (follower_id, following_id) VALUES ($1, $2)`,
    [my_id, target_id]
  );
  return result.rowCount;
}

async function removeFollowerUser(follower_id, following_id) {
  const result = await pool.query(
    `DELETE FROM followers WHERE follower_id = $1 AND following_id = $2`,
    [follower_id, following_id]
  );
  return result.rowCount;
}

async function getFollowInfo(my_id, target_id) {
  const result = await pool.query(
    `SELECT 1 FROM followers WHERE follower_id = $1 AND following_id = $2`,
    [my_id, target_id]
  );
  return { isFollowing: result.rows.length > 0 };
}

async function getFollowerListService(user_id, limit = 10) {
  const result = await pool.query(
    `SELECT
	    u.user_id, 
	    u.user_name, 
	    u.nick_name, 
	    u.profile_img,
	    u.biography
    FROM followers f
    JOIN users u
    ON f.follower_id = u.user_id
    WHERE following_id = $1
    LIMIT $2`,
    [user_id, limit]
  );
  return result.rows;
}

async function getFollowingListService(user_id, limit = 10) {
  const result = await pool.query(
    `SELECT
	    u.user_id, 
	    u.user_name, 
	    u.nick_name, 
	    u.profile_img,
	    u.biography
    FROM followers f
    JOIN users u
    ON f.following_id = u.user_id
    WHERE follower_id = $1
    LIMIT $2`,
    [user_id, limit]
  );
  return result.rows;
}

module.exports = {
  loginService,
  registerUser,
  getProfileService,
  updateMyImgService,
  updateMyBioService,
  changeStateService,
  getAllUserInfo,
  addFollowUser,
  removeFollowerUser,
  getFollowInfo,
  getFollowerListService,
  getFollowingListService,
};
