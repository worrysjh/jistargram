const express = require("express");
const {
  uploadPost,
  getAllPost,
  newComment,
  showAllComment,
  updatePost,
  deletePost,
  deleteComment,
  updateComment,
  countPost,
  countComment,
  getMyPost,
  getUserPost,
} = require("../controllers/postController");
const authenticateToken = require("../middlewares/auth");
const {
  upload,
  uploadToSupabase,
} = require("../middlewares/uploadPostImage");

const router = express.Router();

router.post(
  "/uploadPost",
  authenticateToken,
  upload.single("image"),
  uploadToSupabase,
  uploadPost
);
router.get("/postList", authenticateToken, getAllPost);
router.put(
  "/updatePost/:post_id",
  authenticateToken,
  upload.single("image"),
  uploadToSupabase,
  updatePost
);

router.get("/targetPost/:user_id", getUserPost);

router.delete("/deletePost/:post_id", authenticateToken, deletePost);
router.get("/countPost", authenticateToken, countPost);
router.get("/getMyPost", authenticateToken, getMyPost);

router.post("/newComment", authenticateToken, newComment);
router.post("/showAllComment", authenticateToken, showAllComment);
router.delete("/deleteComment/:comment_id", authenticateToken, deleteComment);
router.patch("/updateComment", authenticateToken, updateComment);
router.get("/countComment", authenticateToken, countComment);

module.exports = router;
