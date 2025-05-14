const { uploadService } = require("../services/postService/uploadService");
const { getPostService } = require("../services/postService/getPostService");
const {
  deletePostService,
} = require("../services/postService/deletePostService");
const {
  newCommentService,
} = require("../services/postService/newCommentService");
const {
  showAllCommentService,
} = require("../services/postService/showAllCommentService");
const {
  deleteCommentService,
} = require("../services/postService/deleteCommentService");
const {
  updateCommentService,
} = require("../services/postService/updateCommentService");

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
async function updatePost(req, res) {
  const { content, media_url } = req.body;
  const post_id = req.post_id;
  try {
    await updatePostService({ content, media_url, post_id });

    res.json({ message: "게시글 수정에 성공하였습니다." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "게시글 수정 실패" });
  }
}

//게시글 삭제
async function deletePost(req, res) {
  const { post_id } = req.params;
  try {
    await deletePostService(post_id);

    res.json({ message: "게시글 삭제에 성공하였습니다." });
  } catch (err) {
    console.error(err);
    res.stauts(500).json({ message: "게시글 삭제 실패" });
  }
}

//게시글 카운트
async function countPost(req, res){
  const {user_id} = req.body;
  try{
    const result = await countPost(user_id);
    res.json(result.result); 
  } catch(err){
    console.error(err);
    res.stauts(500).json({ message: "게시글 카운트 실패" });
  }
}

//댓글 생성
async function newComment(req, res) {
  const { post_id, comment_content, parent_id } = req.body;
  const user_id = req.user.user_id;

  try {
    await newCommentService({
      post_id,
      user_id,
      comment_content,
      parent_id: parent_id || null,
    });

    res.json({ message: "(대)댓글 작성 성공" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 에러" });
  }
}

//댓글 조회
async function showAllComment(req, res) {
  const { post_id } = req.body;

  if (!post_id) {
    return res.status(400).json({ message: "post_id가 없습니다." });
  }

  try {
    const result = await showAllCommentService(post_id);

    res.json(result.result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 에러" });
  }
}

//댓글 수정
async function updateComment(req, res){
  const {comment_id, comment_content} = req.body;
  try{
    await updateCommentService(commet_id, comment_content);
    res.json({ message: "댓글 수정에 성공하였습니다." });
  } catch (err) {
    console.error(err);
    res.stauts(500).json({ message: "댓글 수정 실패" });
  }
}

//댓글 삭제
async function deleteComment(req, res){
  const {comment_id} = req.params;
  try{
    await deleteCommentService(comment_id);
    res.json({ message: "댓글 삭제에 성공하였습니다." });
  } catch (err) {
    console.error(err);
    res.stauts(500).json({ message: "댓글 삭제 실패" });
  }
}

//댓글 카운트
async function countComment(req, res){
  const {post_id} = req.body;
  try{
    const result = await countComment(post_id);
    res.json(result.result); 
  } catch(err){
    console.error(err);
    res.stauts(500).json({ message: "게시글 삭제 실패" });
  }
}

module.exports = {
  uploadPost,
  showPost,
  deletePost,
  newComment,
  showAllComment,
  deleteComment,
  updateComment,
  countPost,
  countComment,
};
