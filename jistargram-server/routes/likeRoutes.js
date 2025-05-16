const express = require("express");
const { check, add, remove, count } = require("../controllers/likeController");
const authenticateToken = require("../middlewares/auth");
const router = express.Router();

router.post("/check", authenticateToken, check);
router.post("/add", authenticateToken, add);
router.delete("/remove", authenticateToken, remove);
router.post("/count", count);

module.exports = router;
