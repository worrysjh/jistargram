const express = require("express");
const {
  uploadPost,
  showPost,
  newComment,
  showAllComment,
  closePost,
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
router.get("/closePost", closePost);
router.post("/newComment", newComment);
router.get("/showAllComment", showAllComment);

module.exports = router;
