const pool = require("../models/db");
const MESSAGE_FETCH_LIMIT = parseInt(process.env.MESSAGE_FETCH_LIMIT, 10) || 20;

// 팔로우 목록 + 들어가진 메시지 방 목록 조회
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

// 참여한 방 기반 반환
async function getRoomList(user_id) {
  const result = await pool.query(
    `
    SELECT 
      mp.room_id, 
      u.user_id, 
      u.user_name, 
      u.nick_name, 
      u.profile_img,
      mr.last_message_id,
      m.content AS last_message_content,
      mr.last_activity_at,
      my_mp.left_at,
      COALESCE(
        (SELECT COUNT(*)
         FROM messages m
         WHERE m.room_id = mp.room_id
           AND m.sender_id != $1
           AND m.timestamp > COALESCE(my_mp.left_at, '1970-01-01'::timestamp)
        ), 0
      ) AS unread_count
    FROM message_participant mp
    JOIN users u ON mp.user_id = u.user_id
    LEFT JOIN message_rooms mr ON mp.room_id = mr.room_id
    LEFT JOIN messages m ON mr.last_message_id = m.message_id
    LEFT JOIN message_participant my_mp ON mp.room_id = my_mp.room_id AND my_mp.user_id = $1
    WHERE mp.room_id IN (
        SELECT room_id 
        FROM message_participant 
        WHERE user_id = $1
    )
    AND mp.user_id != $1
    ORDER BY mr.last_activity_at DESC NULLS LAST;
  `,
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
  // last_message_id가 유효한 경우에만 업데이트
  if (last_message_id) {
    await pool.query(
      `UPDATE message_rooms
      SET last_message_id = $2, last_activity_at = $3
      WHERE room_id = $1`,
      [room_id, last_message_id, last_activity_at]
    );
  } else {
    // last_message_id가 없으면 last_activity_at만 업데이트
    await pool.query(
      `UPDATE message_rooms
      SET last_activity_at = $2
      WHERE room_id = $1`,
      [room_id, last_activity_at]
    );
  }
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
async function getMessageContent(room_id, offset = 0, limit = MESSAGE_FETCH_LIMIT) {
  const message = await pool.query(
    `SELECT * FROM messages 
     WHERE room_id = $1 
     ORDER BY timestamp DESC 
     LIMIT $2 OFFSET $3`,
    [room_id, limit, offset]
  );

  // 오래된 순서로 뒤집어서 반환
  return message.rows.reverse();
}

// 메시지 전송시 저장
async function saveMessage(
  room_id,
  sender_id,
  receiver_id,
  content,
  content_type = "text"
) {
  const result = await pool.query(
    `INSERT INTO messages (room_id, sender_id, receiver_id, content, content_type, timestamp)
    VALUES ($1, $2, $3, $4, $5, NOW())
    RETURNING message_id, timestamp`,
    [room_id, sender_id, receiver_id, content, content_type]
  );

  return result.rows[0];
}

// 안읽은 메시지 개수 조회
async function getUnreadMessageCount(room_id, user_id) {
  const result = await pool.query(
    `SELECT 
      m.room_id,
      COUNT(m.message_id) AS unread_count
    FROM messages m
    JOIN message_participant mp ON m.room_id = mp.room_id
    WHERE mp.room_id = $1
      AND mp.user_id = $2
      AND m.timestamp  > mp.left_at
    GROUP BY m.room_id;`,
    [room_id, user_id]
  );
  return result.rows;
}

// 메시지 읽음 처리
async function markMessagesAsRead(room_id, user_id) {
  const result = await pool.query(
    `UPDATE message_participant
     SET left_at = NOW()
     WHERE room_id = $1 AND user_id = $2
     RETURNING left_at`,
    [room_id, user_id]
  );

  return result.rows[0];
}

module.exports = {
  getExpMessageRoomList,
  getRoomList,
  createMessageRoom,
  joinMessageRoom,
  updateMessageRoom,
  checkMessageRoom,
  getMessageContent,
  saveMessage,
  getUnreadMessageCount,
  markMessagesAsRead,
};
