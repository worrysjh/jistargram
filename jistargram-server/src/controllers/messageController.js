const {
  getMessageContent,
  saveMessage,
} = require("../services/message.service");

// 기존 메시지 이력 조회
async function getMessage(req, res) {
  const { user_id: target_user_id } = req.params;
  const { user_id, user_name } = req.user;
  console.log("대상: " + target_user_id + " 보낸이: " + user_id);
  try {
    const data = await getMessageContent(user_id, target_user_id);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(400).json({ message: "대화 내역 조회 실패" });
  }
}

// 메시지 전송시 저장장
async function sendMessage(req, res) {
  console.log(req.body);
  const { sender_id, receiver_id, content } = req.body;

  try {
    if (!content || content.trim() === "") {
      return res.status(400).json({ message: "메시지 내용이 비어있습니다." });
    }
    await saveMessage(sender_id, receiver_id, content);
    return res.status(201).json({ success: true });
  } catch (err) {
    console.log("메시지 저장 실패: ", err);
    res.status(500).json({ message: "메시지 저장 실패" });
  }
}

module.exports = { getMessage, sendMessage };
