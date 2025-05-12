const express = require("express");
const { uploadPost, showPost } = require("../controllers/postController");
const authenticateToken = require("../middlewares/auth");
const upload = require("../middlewares/uploadPostImage");

const router = express.Router();

router.post(
  "/uploadPost",
  authenticateToken,
  upload.single("image"),
  uploadPost
);
router.get("/showAllPost", showPost);

module.exports = router;
