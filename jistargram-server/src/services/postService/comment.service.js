const pool = require("../../models/db");

// 댓글 신규 등록
async function newCommentService({
  post_id,
  user_id,
  comment_content,
  parent_id,
}) {
  await pool.query(
    `INSERT INTO comments (post_id, user_id, comment_content, parent_id) VALUES ($1, $2, $3, $4)`,
    [post_id, user_id, comment_content, parent_id]
  );

  return { success: true };
}

// 댓글 상태 삭제 변경
async function deleteCommentService(comment_id) {
  await pool.query(
    `UPDATE comments SET comment_state = '삭제' WHERE comment_id = $1`,
    [comment_id]
  );

  return { success: true };
}

// 댓글 수정
// 기능 미구현
async function updateCommentService(comment_id, comment_content) {
  await pool.query(
    `UPDATE comments SET comment_content = $1 WHERE comment_id = $2`,
    [comment_content, comment_id]
  );

  return { success: true };
}

// 전체 댓글 조회
async function showAllCommentService(post_id) {
  const result = await pool.query(
    `SELECT
        c.*,
        u.user_id,
        u.user_name
      FROM comments c
      JOIN users u
        ON c.user_id = u.user_id
      WHERE c.post_id = $1`,
    [post_id]
  );

  return { success: true, result: result.rows };
}

// 댓글 수 카운트
async function countCommentService(post_id) {
  const result = await pool.query(
    `SELECT COUNT(*) FROM comments WHERE post_id = $1`,
    [post_id]
  );

  return { success: true, result };
}

module.exports = {
  newCommentService,
  deleteCommentService,
  updateCommentService,
  showAllCommentService,
  countCommentService,
};
