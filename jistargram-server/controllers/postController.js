const pool = require("../models/db");
const path = require("path");
const fs = require("fs");

//게시글 등록
async function uploadPost(req, res) {
  const { content } = req.body;
  const image = `/uploads/post_imgs/${req.file.filename}`;
  const username = req.user.username;
  try {
    const result = await pool.query(
      "SELECT userid FROM users WHERE username = $1",
      [username]
    );
    const author_id = result.rows[0]?.userid;

    await pool.query(
      "INSERT INTO posts (author_id, content, media_url) values ($1, $2, $3)",
      [author_id, content, image]
    );
    console.log(content);
    res.status(200).json({ message: "게시글 등록 성공" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "게시글 등록 실패" });
  }
}

//게시글 전체 조회
async function showPost(req, res) {
  try {
    const result = await pool.query(
      "SELECT posts.content, posts.media_url, users.username FROM posts JOIN users ON posts.author_id = users.userid ORDER BY posts.created_at DESC"
    );

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 에러" });
  }
}

//게시글 수정

//게시글 삭제

module.exports = {
  uploadPost,
  showPost,
};
