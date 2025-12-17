const { v5: uuidv5 } = require("uuid");
const services = require("../services");

// 팔로우 목록 + 수신받은 미팔로우 메시지 방 목록 조회
async function getExpMessageRoomList(req, res) {
  const { user_id } = req.user;
  console.log("대화 방 목록 조회 대상: ", user_id);
  try {
    const result = await services.getExpMessageRoomList(user_id);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(400).json({ message: "대화 방 목록 조회 실패" });
  }
}

// 방 존재 유무 확인
async function checkMessageRoom(req, res) {
  const target_user_id = req.params.user_id;
  const { user_id } = req.user;
  console.log("대상: " + target_user_id + " 보낸이: " + user_id);
  const room_id = generateRoomId(user_id, target_user_id);

  const result = await services.checkMessageRoom(room_id);
  console.log("방 존재 여부: ", result);
  return res.status(200).json({ exists: result, roomId: room_id });
}

// 방 생성
// async function createMessageRoom(req, res) {
//   const { user_id: target_user_id } = req.body;
//   const { user_id } = req.user;
//   console.log("대상: " + target_user_id + " 보낸이: " + user_id);
//   try {
//     const roomId = generateRoomId(user_id, target_user_id);
//     // 방 존재 재검사 : 충돌방지
//     if (await services.checkMessageRoom(roomId)) {
//       return res
//         .status(200)
//         .json({ message: "이미 존재하는 대화 방입니다.", roomId });
//     }
//     // 없을시 룸 생성 후 참가
//     else {
//       await services.createMessageRoom(roomId);
//       await services.joinMessageRoom(roomId, user_id, target_user_id);
//       return res
//         .status(201)
//         .json({ message: "대화 방이 생성되었습니다.", roomId });
//     }
//   } catch (err) {
//     return res.status(400).json({ message: "대화 방 생성 실패" });
//   }
// }

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
  const { sender_id, receiver_id, content, content_type } = req.body;

  if (!sender_id || !receiver_id || !content) {
    return res
      .status(400)
      .json({ message: "sender_id, receiver_id, content가 필요합니다." });
  }

  let room_id;
  try {
    room_id = generateRoomId(sender_id, receiver_id);
  } catch (err) {
    console.error("room id 생성 오류:", err);
    return res.status(400).json({ message: "유효하지 않은 사용자 ID" });
  }

  console.log("방 이름 : " + room_id);
  try {
    const roomExists = await services.checkMessageRoom(room_id);
    console.log("방 존재 여부: ", roomExists);

    // 방이 없으면 생성
    if (!roomExists) {
      await services.createMessageRoom(room_id);
      await services.joinMessageRoom(room_id, sender_id, receiver_id);
      console.log("새 방 생성: ", room_id);
    }

    // 메시지 저장
    const savedMessage = await services.saveMessage(
      room_id,
      sender_id,
      receiver_id,
      content,
      content_type || "text"
    );

    // 성공 응답 + room_id 반환
    return res.status(201).json({
      success: true,
      room_id: room_id,
      message: savedMessage,
    });
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
  getExpMessageRoomList,
  checkMessageRoom,
  getMessage,
  sendMessage,
};
