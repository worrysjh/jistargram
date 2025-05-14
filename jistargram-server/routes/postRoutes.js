const express = require("express");
const {
  uploadPost,
  showPost,
  newComment,
  showAllComment,
  deletePost,
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
router.get("/showPost", showPost);
router.get("/deletePost", deletePost);
router.post("/newComment", authenticateToken, newComment);
router.post("/showAllComment", showAllComment);

module.exports = router;
