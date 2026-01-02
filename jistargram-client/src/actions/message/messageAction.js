const API_URL = process.env.REACT_APP_API_URL;

// 대화 방 존재 여부 확인
export const checkMessageRoom = async (targetUserId) => {
  try {
    const res = await fetch(
      `${API_URL}/messages/checkMessageRoom/${targetUserId}`,
      { credentials: "include" }
    );

    if (!res.ok) {
      throw new Error(`대화 방 확인 실패, status: ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    throw err;
  }
};

// 메시지 목록 조회
export const getMessages = async (targetUserId, offset = 0, limit = 20) => {
  try {
    const res = await fetch(
      `${API_URL}/messages/${targetUserId}?offset=${offset}&limit=${limit}`,
      { credentials: "include" }
    );

    if (!res.ok) {
      throw new Error(`메시지 조회 실패, status: ${res.status}`);
    }

    const msgData = await res.json();
    return Array.isArray(msgData)
      ? msgData
      : Array.isArray(msgData.messages)
        ? msgData.messages
        : [];
  } catch (err) {
    throw err;
  }
};

// 메시지 전송
export const sendMessageToServer = async (messagePayload) => {
  try {
    const res = await fetch(`${API_URL}/messages/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(messagePayload),
    });

    if (!res.ok) {
      throw new Error(`메시지 저장 실패, status: ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    throw err;
  }
};

// 메시지 읽음 처리
export const markMessagesAsRead = async (roomId, userId) => {
  try {
    const res = await fetch(`${API_URL}/messages/markAsRead`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        room_id: roomId,
        user_id: userId,
      }),
    });

    if (!res.ok) {
      throw new Error(`읽음 처리 실패, status: ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    throw err;
  }
};
