const pool = require("../models/db");

async function getMessageContent(user_id, target_user_id) {
  const message = await pool.query(
    `SELECT * FROM messages
        WHERE (sender_id = $1 AND receiver_id = $2)
          OR (sender_id = $2 AND receiver_id = $1)
        ORDER BY message_id ASC`,
    [user_id, target_user_id]
  );

  return message.rows;
}

async function saveMessage(sender_id, receiver_id, content) {
  await pool.query(
    `INSERT INTO messages (sender_id, receiver_id, content)
        VALUES ($1, $2, $3)`,
    [sender_id, receiver_id, content]
  );

  return { success: true };
}

module.exports = { getMessageContent, saveMessage };
