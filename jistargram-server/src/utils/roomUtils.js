const { v5: uuidv5 } = require("uuid");

/**
 * 두 사용자 ID를 기반으로 고유한 Room ID를 생성합니다.
 * @param {string} userId1 - 첫 번째 사용자 ID
 * @param {string} userId2 - 두 번째 사용자 ID
 * @returns {string} UUID v5 기반 Room ID
 */
function generateRoomId(userId1, userId2) {
  const JISTARGRAM_NAMESPACE = process.env.JISTARGRAM_NAMESPACE;
  const sortedIds = [userId1, userId2].sort();
  const combinedString = sortedIds.join("_");

  const roomId = uuidv5(combinedString, JISTARGRAM_NAMESPACE);
  return roomId;
}

/**
 * 주어진 roomId가 두 사용자 ID로 생성된 것인지 검증합니다.
 * @param {string} roomId - 검증할 Room ID
 * @param {string} userId1 - 첫 번째 사용자 ID
 * @param {string} userId2 - 두 번째 사용자 ID
 * @returns {boolean} 유효한 경우 true, 그렇지 않으면 false
 */
function validateRoomId(roomId, userId1, userId2) {
  const expectedRoomId = generateRoomId(userId1, userId2);
  return roomId === expectedRoomId;
}

module.exports = {
  generateRoomId,
  validateRoomId,
};
