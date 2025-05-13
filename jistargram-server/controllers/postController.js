const { uploadService } = require("../services/postService/uploadService");
const { getPostService } = require("../services/postService/getPostService");

//게시글 등록
async function uploadPost(req, res) {
  const user_id = req.user.user_id;
  const { content } = req.body;
  const media_url = `/uploads/post_imgs/${req.file.filename}`;

  try {
    await uploadService({ user_id, content, media_url });

    res.status(200).json({ message: "게시글 등록 성공" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "게시글 등록 실패" });
  }
}

//게시글 전체 조회
async function showPost(req, res) {
  try {
    const result = await getPostService();

    res.json(result.result);
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
