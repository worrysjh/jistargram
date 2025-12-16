const { v5: uuidv5 } = require("uuid");
const services = require("../services");

// 방 존재 유무 확인
async function checkMessageRoom(req, res) {
  const target_user_id = req.params.user_id;
  const { user_id } = req.user;
  console.log("대상: " + target_user_id + " 보낸이: " + user_id);
  const room_id = generateRoomId(user_id, target_user_id);

  const result = await services.checkMessageRoom(room_id);
  console.log("방 존재 여부: ", result);
  return res.status(200).json({ exists: result });
}

// 방 생성
async function createMessageRoom(req, res) {
  const { user_id: target_user_id } = req.body;
  const { user_id } = req.user;
  console.log("대상: " + target_user_id + " 보낸이: " + user_id);
  try {
    const roomId = generateRoomId(user_id, target_user_id);
    // 방 존재 재검사 : 충돌방지
    if (await services.checkMessageRoom(roomId)) {
      return res
        .status(200)
        .json({ message: "이미 존재하는 대화 방입니다.", roomId });
    }
    // 없을시 룸 생성
    else {
      await services.createMessageRoom(roomId);
      return res
        .status(201)
        .json({ message: "대화 방이 생성되었습니다.", roomId });
    }
  } catch (err) {
    return res.status(400).json({ message: "대화 방 생성 실패" });
  }
}

// 기존 메시지 이력 조회
async function getMessage(req, res) {
  const { user_id: target_user_id } = req.params;
  const { user_id } = req.user;
  console.log("대상: " + target_user_id + " 보낸이: " + user_id);
  const room_id = generateRoomId(user_id, target_user_id);
  console.log("조회할 방 ID: " + room_id);
  try {
    console.log("메시지 조회 서비스 호출 전");
    const data = await services.getMessageContent(room_id);
    console.log("메시지 데이터:", data);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(400).json({ message: "대화 내역 조회 실패" });
  }
}

// 메시지 전송시 저장
async function sendMessage(req, res) {
  console.log(req.body);
  const { sender_id, receiver_id, content } = req.body;
  const room_id = generateRoomId(sender_id, receiver_id);
  console.log("방 이름 : " + room_id);
  try {
    const roomExists = await services.checkMessageRoom(room_id);
    console.log("방 존재 여부: ", roomExists);
    // 방이 없으면, 방을 만들고 메시지 송수신 및 DB 저장
    if (!roomExists) {
      await services.createMessageRoom(room_id);
    }
    // 방이 있으면, 있는 방에 메시지 송수신 및 저장
    await services.saveMessage(room_id, sender_id, receiver_id, content);
    return res.status(201).json({ success: true });
  } catch (err) {
    console.log("메시지 저장 실패: ", err);
    return res.status(500).json({ message: "메시지 저장 실패" });
  }
}

// 두 사용자 ID로 ROOM ID 생성하기
function generateRoomId(userId1, userId2) {
  const JISTARGRAM_NAMESPACE = process.env.JISTARGRAM_NAMESPACE;
  const sotredIds = [userId1, userId2].sort();
  const combinedString = sotredIds.join("_");

  const roomId = uuidv5(combinedString, JISTARGRAM_NAMESPACE);
  return roomId;
}

module.exports = {
  checkMessageRoom,
  createMessageRoom,
  getMessage,
  sendMessage,
};
