const pool = require("../models/db");

// 팔로우 목록 + 수신받은 미팔로우 메시지 방 목록 조회
async function getExpMessageRoomList(user_id) {
  const result = await pool.query(
    `
    SELECT u.user_id, u.user_name, u.nick_name, u.profile_img 
    FROM followers f
    JOIN users u 
    ON f.following_id = u.user_id
    WHERE f.follower_id = $1
    UNION
    SELECT u.user_id, u.user_name, u.nick_name, u.profile_img
    FROM message_participant mp1
    JOIN message_participant mp2 ON mp1.room_id = mp2.room_id
    JOIN users u ON mp2.user_id = u.user_id
    WHERE mp1.user_id = $1
    AND mp2.user_id <> $1
    AND mp2.user_id not in (
      SELECT following_id
      FROM followers f WHERE follower_id = $1
    )`,
    [user_id]
  );
  return result.rows;
}

// 채팅 방 생성
async function createMessageRoom(room_id) {
  await pool.query(
    `INSERT INTO message_rooms (room_id, last_activity_at)
        VALUES ($1, NOW())`,
    [room_id]
  );
}

// 채팅 방 참가
async function joinMessageRoom(room_id, user_id, target_user_id) {
  await pool.query(
    `INSERT INTO message_participant (room_id, user_id) VALUES ($1, $2), ($1, $3)`,
    [room_id, user_id, target_user_id]
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
  getExpMessageRoomList,
  createMessageRoom,
  joinMessageRoom,
  checkMessageRoom,
  getMessageContent,
  saveMessage,
};
