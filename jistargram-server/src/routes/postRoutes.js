const express = require("express");
const {
  uploadPost,
  showPost,
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
const upload = require("../middlewares/uploadPostImage");

const router = express.Router();

router.post(
  "/uploadPost",
  authenticateToken,
  upload.single("image"),
  uploadPost
);
router.get("/showPost", authenticateToken, showPost);
router.put(
  "/updatePost/:post_id",
  authenticateToken,
  upload.single("image"),
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
