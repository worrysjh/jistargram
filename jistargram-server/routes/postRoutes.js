const express = require("express");
const { uploadPost, showPost } = require("../controllers/postController");
const authenticateToken = require("../middlewares/auth");

const router = express.Router();

router.post("/uploadPost", authenticateToken, uploadPost);
router.get("/showAllPost", showPost);

module.exports = router;
