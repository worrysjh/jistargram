import { useEffect, useState, useRef } from "react";
import { socket } from "utils/socket";
import "styles/MessageModal.css";

export default function ChatWindow({ selectedUser, currentUser, onClose }) {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [roomId, setRoomId] = useState(null);
  const prevSelectedRef = useRef(null);

  // roomId가 생성된 후에만 join (메시지 송신 후)
  useEffect(() => {
    if (!roomId) return;

    socket.emit("join_room", roomId);
    console.log("Room 참가: ", roomId);

    return () => {
      socket.emit("leave_room", roomId);
      console.log("Room 나가기: ", roomId);
    };
  }, [roomId]);

  useEffect(() => {
    if (!selectedUser?.user_id) {
      setRoomId(null);
      setMessages([]);
      prevSelectedRef.current = null;
      return;
    }

    // 재선택 시 선택 해제
    if (prevSelectedRef.current === selectedUser.user_id) {
      setRoomId(null);
      setMessages([]);
      prevSelectedRef.current = selectedUser.user_id;
      return;
    }

    let mounted = true;
    (async () => {
      try {
        // 1. 방 존재 여부 확인 (roomId는 서버에서 계산해서 반환)
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/messages/checkMessageRoom/${selectedUser.user_id}`,
          { credentials: "include" }
        );

        if (!res.ok) {
          console.error("대화 방 확인 실패, status:", res.status);
          if (mounted) setMessages([]);
          return;
        }

        const data = await res.json(); // { exists: boolean, roomId: string }
        console.log("대화 방 확인 결과: ", data);
        console.log("roomid: ", data.roomId);
        if (!mounted) return;

        // 2. 방이 존재하면 roomId 설정 + 기존 메시지 불러오기
        if (data.exists && data.roomId) {
          setRoomId(data.roomId);

          const msgRes = await fetch(
            `${process.env.REACT_APP_API_URL}/messages/${selectedUser.user_id}`,
            { credentials: "include" }
          );

          if (msgRes.ok) {
            const msgData = await msgRes.json();
            const list = Array.isArray(msgData)
              ? msgData
              : Array.isArray(msgData.messages)
                ? msgData.messages
                : [];
            if (mounted) setMessages(list);
            console.log("기존 메시지 불러오기 성공:", list);
          } else {
            console.error("메시지 조회 실패:", msgRes.status);
            if (mounted) setMessages([]);
          }
        } else {
          // 방이 없으면 메시지 비우기 (최초 메시지 전송 시 생성됨)
          if (mounted) {
            setRoomId(null);
            setMessages([]);
          }
        }
      } catch (err) {
        console.error("대화 방 조회 오류:", err);
        if (mounted) setMessages([]);
      }
    })();

    prevSelectedRef.current = selectedUser.user_id;

    return () => {
      mounted = false;
    };
  }, [selectedUser?.user_id]);

  // receive_message 핸들러
  useEffect(() => {
    const handleReceive = (message) => {
      console.log("메시지 수신:", message);

      // roomId 기반 필터링 (안전장치)
      if (roomId && message.roomId !== roomId) return;

      setMessages((prev) => [...prev, message]);
    };

    socket.on("receive_message", handleReceive);
    return () => {
      socket.off("receive_message", handleReceive);
    };
  }, [roomId]);

  const sendMessage = async () => {
    if (!content.trim()) return;
    if (!selectedUser?.user_id || !currentUser?.user_id) {
      alert("사용자 정보가 없습니다.");
      return;
    }

    const messagePayload = {
      sender_id: currentUser.user_id,
      receiver_id: selectedUser.user_id,
      content: content.trim(),
      content_type: "text",
    };

    try {
      // 1. 서버로 메시지 전송 (DB 저장 + room 생성)
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/messages/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(messagePayload),
        }
      );

      if (!res.ok) {
        console.error("메시지 저장 실패:", res.status);
        alert("메시지 전송에 실패했습니다.");
        return;
      }

      const result = await res.json(); // { success: true, room_id: "..." }
      console.log("메시지 저장 성공:", result);

      // 2. 최초 전송인 경우(roomId가 없었던 경우) roomId 설정 → useEffect에서 자동 join
      if (!roomId && result.room_id) {
        setRoomId(result.room_id);
      }

      // 3. 소켓으로 메시지 전송 (방에 broadcast)
      socket.emit("send_message", {
        ...messagePayload,
        roomId: result.room_id || roomId,
      });

      // 4. UI에 즉시 반영 (낙관적 업데이트)
      setMessages((prev) => [
        ...prev,
        {
          ...messagePayload,
          timestamp: new Date().toISOString(),
        },
      ]);

      setContent("");
    } catch (err) {
      console.error("메시지 전송 실패:", err);
      alert("메시지 전송 중 오류가 발생했습니다.");
    }
  };

  if (!selectedUser) {
    return (
      <div className="chat-window">
        <div className="empty-window">메시지를 보내보세요</div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-header-user">
          {selectedUser.profile_img ? (
            <img
              src={`${process.env.REACT_APP_API_URL}${selectedUser.profile_img}`}
              alt={selectedUser.nick_name}
              className="chat-avatar"
            />
          ) : (
            <div className="chat-avatar-placeholder">
              {selectedUser.nick_name?.charAt(0) || "?"}
            </div>
          )}
          <span className="chat-username">{selectedUser.nick_name}</span>
        </div>
        <button className="chat-close" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="message-box">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`message ${
              msg.sender_id === currentUser?.user_id ? "sent" : "received"
            }`}
          >
            <p>{msg.content}</p>
          </div>
        ))}
      </div>

      <div className="message-input">
        <input
          type="text"
          placeholder="메시지 입력..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>전송</button>
      </div>
    </div>
  );
}
