const pool = require("../models/db");

// 좋아요 체크 여부
async function checkLike(user_id, target_type, target_id) {
  const result = await pool.query(
    `SELECT 1 FROM likes
     WHERE user_id = $1 AND target_type = $2 AND target_id = $3`,
    [user_id, target_type, target_id]
  );

  return result.rowCount > 0;
}

// 좋아요 추가
async function addLike(user_id, target_type, target_id) {
  await pool.query(
    `INSERT INTO likes (user_id, target_type, target_id) VALUES ($1, $2, $3)`,
    [user_id, target_type, target_id]
  );

  return { success: true };
}

// 좋아요 취소
async function removeLike(user_id, target_type, target_id) {
  await pool.query(
    `DELETE FROM likes
         WHERE user_id = $1 AND target_type = $2 AND target_id = $3`,
    [user_id, target_type, target_id]
  );

  return { success: true };
}

// 좋아요 수 집계
async function countLike(target_type, target_id) {
  const result = await pool.query(
    `SELECT COUNT(*) FROM likes
         WHERE target_type = $1 AND target_id = $2`,
    [target_type, target_id]
  );

  return { result };
}

module.exports = { checkLike, addLike, removeLike, countLike };
