const express = require("express");
const {pressLike, cancleLike, countLike} = require("../controllers/likeController");
const authenticateToken = require("../middlewares/auth");
const router = express.Router();

router.post("/pressLike", authenticateToken, pressLike);
router.delete("/cancleLike/:like_id", authenticateToken, cancleLike);
router.get("/countLike", countLike);

module.exports = router;