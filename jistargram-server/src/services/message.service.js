const pool = require("../models/db");

// 채팅 방 생성
async function createMessageRoom(room_id) {
  await pool.query(
    `INSERT INTO message_rooms (room_id, last_activity_at)
        VALUES ($1, NOW())`,
    [room_id]
  );
}

// 채팅방 내용 업데이트
async function updateMessageRoom(room_id, last_message_id, last_activity_at) {
  await pool.query(
    `UPDATE message_rooms
    SET last_message_id = $2, last_activity_at = $3
    WHERE room_id = $1
    `,
    [room_id, last_message_id, last_activity_at]
  );
}

// 채팅방 존재 유무 확인
async function checkMessageRoom(room_id) {
  const result = await pool.query(
    `SELECT room_id FROM message_rooms WHERE room_id = $1`,
    [room_id]
  );
  if (!result) return false;
  return result.rows.length > 0;
}

// 기존 메시지 이력 조회
async function getMessageContent(room_id) {
  const message = await pool.query(
    `SELECT * FROM messages WHERE room_id = $1 ORDER BY timestamp ASC`,
    [room_id]
  );

  return message.rows;
}

// 메시지 전송시 저장
async function saveMessage(
  room_id,
  sender_id,
  receiver_id,
  content,
  content_type = "text"
) {
  await pool.query(
    `INSERT INTO messages (room_id, sender_id, receiver_id, content, content_type)
        VALUES ($1, $2, $3, $4, $5)`,
    [room_id, sender_id, receiver_id, content, content_type]
  );

  return { success: true };
}

module.exports = {
  createMessageRoom,
  checkMessageRoom,
  getMessageContent,
  saveMessage,
};
