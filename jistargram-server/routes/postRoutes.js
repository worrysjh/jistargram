const express = require("express");
const {
  uploadPost,
  showPost,
  newComment,
  showAllComment,
  deletePost,
  deleteComment,
  updateComment,
  countPost,
  countComment,
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
router.delete("/deletePost/:post_id", authenticateToken, deletePost);
router.get("/countPost", countPost);

router.post("/newComment", authenticateToken, newComment);
router.post("/showAllComment", showAllComment);
router.delete("/deleteComment/:comment_id", authenticateToken, deleteComment);
router.patch("/updateComment", authenticateToken, updateComment);
router.get("/countComment", countComment);

module.exports = router;
