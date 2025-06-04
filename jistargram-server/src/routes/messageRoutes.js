const express = require("express");
const router = express.Router();
const { getMessage, sendMessage } = require("../controllers/messageController");
const authenticateToken = require("../middlewares/auth");

router.get("/:user_id", authenticateToken, getMessage);
router.post("/sendMessage", authenticateToken, sendMessage);

module.exports = router;
