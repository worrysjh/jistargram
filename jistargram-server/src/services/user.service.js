const pool = require("../models/db");
const bcrypt = require("bcrypt");

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
async function updateMyImgService({ user_name, imageUrl }) {
  // DB 업데이트 - Supabase URL을 직접 저장
  await pool.query(`UPDATE users SET profile_img = $1 WHERE user_name = $2`, [
    imageUrl,
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
  const params = [];
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

  params.push(my_id);

  // 검색 키워드가 있으면 추가
  if (keyword) {
    params.push(`%${keyword}%`);
    query += ` AND (u.user_name ILIKE $${params.length} OR u.nick_name ILIKE $${params.length})`;
  }

  query += ` ORDER BY u.user_name`;

  try {
    const result = await pool.query(query, params);
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
