const pool = require("../../models/db");

// 게시글 등록
async function uploadService({ user_id, content, media_url }) {
  await pool.query(
    `INSERT INTO posts (user_id, content, media_url) values($1, $2, $3)`,
    [user_id, content, media_url]
  );

  return { success: true };
}

// 게시글 수정
async function updatePostService({ content, media_url, post_id }) {
  await pool.query(
    `UPDATE posts SET content = $1, media_url = $2 WHERE post_id = $3`,
    [content, media_url, post_id]
  );

  return { success: true };
}

// 게시글 상태 삭제 변경
async function deletePostService(post_id) {
  await pool.query(`UPDATE posts SET post_state = '삭제' WHERE post_id = $1`, [
    post_id,
  ]);

  return { success: true };
}

// 전체 게시글 조회
async function getPostService() {
  const result = await pool.query(
    `SELECT
        p.post_id,
        p.content,
        p.media_url,
        p.created_at,
        u.user_id,
        u.user_name,
        u.profile_img,
        COUNT(c.comment_id) AS comment_count
      FROM posts p
      JOIN users u ON p.user_id = u.user_id
      LEFT JOIN comments c
        ON c.post_id = p.post_id AND c.comment_state = '생성'
      WHERE p.post_state = '공개'
      GROUP BY
        p.post_id, p.content, p.media_url, p.created_at,
        u.user_id, u.user_name, u.profile_img
      ORDER BY p.created_at DESC;
      `
  );

  return { success: true, result: result.rows };
}

// 소유 게시글 조회
async function getMyPostService(user_id) {
  const result = await pool.query(
    `SELECT 
        p.post_id, 
        p.content, 
        p.media_url, 
        p.created_at, 
        u.user_name, 
        u.profile_img
       FROM posts p 
       JOIN users u 
        ON p.user_id = u.user_id 
       WHERE p.user_id = $1 
       ORDER BY p.created_at DESC`,
    [user_id]
  );

  return { success: true, result: result.rows };
}

// 공개 게시글 수 카운팅
async function countPostService(user_id) {
  const result = await pool.query(
    `SELECT COUNT(*) FROM posts
       WHERE user_id = $1 && post_state = '공개'`,
    [user_id]
  );

  return { success: true, result };
}

module.exports = {
  uploadService,
  deletePostService,
  countPostService,
  getPostService,
  getMyPostService,
  updatePostService,
};
