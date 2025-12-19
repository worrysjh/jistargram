const express = require("express");
const router = express.Router();
const {
  getExpMessageRoomList,
  checkMessageRoom,
  getMessage,
  sendMessage,
  markMessagesAsRead,
} = require("../controllers/messageController");
const authenticateToken = require("../middlewares/auth");

router.get("/expMessageRoomList", authenticateToken, getExpMessageRoomList);
router.get("/:user_id", authenticateToken, getMessage);
router.post("/sendMessage", authenticateToken, sendMessage);
router.post("/markAsRead", authenticateToken, markMessagesAsRead);
router.get("/checkMessageRoom/:user_id", authenticateToken, checkMessageRoom);

module.exports = router;
