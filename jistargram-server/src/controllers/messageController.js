const services = require("../services");
const { generateRoomId } = require("../utils/roomUtils");

// 팔로우 목록 + 수신받은 미팔로우 메시지 방 목록 조회
async function getExpMessageRoomList(req, res) {
  const { user_id } = req.user;
  console.log("대화 방 목록 조회 대상: ", user_id);
  try {
    //const result = await services.getExpMessageRoomList(user_id);
    const result = await services.getRoomList(user_id);
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

// 기존 메시지 이력 조회
async function getMessage(req, res) {
  const { user_id: target_user_id } = req.params;
  const { user_id } = req.user;
  const { offset = 0, limit = 20 } = req.query; // 쿼리 파라미터 추가

  console.log("대상: " + target_user_id + " 보낸이: " + user_id);
  console.log(`offset: ${offset}, limit: ${limit}`);

  const room_id = generateRoomId(user_id, target_user_id);

  try {
    const messages = await services.getMessageContent(
      room_id,
      parseInt(offset),
      parseInt(limit)
    );

    res.status(200).json(messages);
  } catch (err) {
    console.error("메시지 조회 실패:", err);
    res.status(500).json({ error: "메시지 조회 실패" });
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

    // room 업데이트
    if (savedMessage) {
      await services.updateMessageRoom(
        room_id,
        savedMessage.message_id,
        savedMessage.timestamp
      );
    }

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



// 안읽은 메시지 개수 조회
async function getUnreadMessageCount(req, res) {
  const { user_id } = req.user;
  try {
    const count = await services.getUnreadMessageCount(user_id);
    return res.status(200).json({ unreadCount: count });
  } catch (err) {
    return res.status(400).json({ message: "안읽은 메시지 개수 조회 실패" });
  }
}

// 메시지 읽음 처리
async function markMessagesAsRead(req, res) {
  const { room_id, user_id } = req.body;
  try {
    await services.markMessagesAsRead(room_id, user_id);
    console.log(`메시지 읽음 처리 완료 - 방: ${room_id}, 사용자: ${user_id}`);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("메시지 읽음 처리 실패:", err);
    return res.status(400).json({ message: "메시지 읽음 처리 실패" });
  }
}

module.exports = {
  getExpMessageRoomList,
  checkMessageRoom,
  getMessage,
  sendMessage,
  getUnreadMessageCount,
  markMessagesAsRead,
};
