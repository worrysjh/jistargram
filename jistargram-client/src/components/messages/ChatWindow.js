import { useEffect, useState, useRef } from "react";
import { socket } from "utils/socket";
import "styles/MessageModal.css";

export default function ChatWindow({ selectedUser, currentUser, onClose }) {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [roomId, setRoomId] = useState(null);
  const prevSelectedRef = useRef(null);

  useEffect(() => {
    if (currentUser?.user_id) {
      socket.emit("join", currentUser.user_id);
      console.log("방 참가: ", currentUser.user_id);
    }
  }, [currentUser]);

  useEffect(() => {
    // selectedUser가 없으면 실행하지 않음
    if (!selectedUser?.user_id) {
      if (roomId) {
        socket.emit("leave_room", roomId);
        setRoomId(null);
      }
      setMessages([]);
      prevSelectedRef.current = null;
      return;
    }

    if (prevSelectedRef.current === selectedUser.user_id) {
      if (roomId) {
        socket.emit("leave_room", roomId);
        setRoomId(null);
      }
      setMessages([]);

      prevSelectedRef.current = selectedUser.user_id;
      return;
    }

    let mounted = true;
    (async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/messages/checkMessageRoom/${selectedUser.user_id}`,
          {
            credentials: "include", // 쿠키 포함
          }
        );
        if (!res.ok) {
          console.error("대화 방 확인 실패, status:", res.status);
          if (mounted) setMessages([]);
          return;
        }

        const data = await res.json();
        console.log("대화 방 존재 여부: ", data);
        if (!mounted) return;

        // 방이 존재하면 기존 메시지 불러오기
        if (data.roomId) {
          if (roomId && roomId !== data.roomId) {
            socket.emit("leave_room", roomId);
          }

          setRoomId(data.roomId);
          socket.emit("join_room", data.roomId);
        }
        if (data.exists) {
          const res = await fetch(
            `${process.env.REACT_APP_API_URL}/messages/${selectedUser.user_id}`,
            {
              credentials: "include", // 쿠키 포함
            }
          );

          if (!res.ok) {
            console.error("메시지 조회 실패:", res.status);
            setMessages([]);
            return;
          }

          const data = await res.json();
          console.log("fetched messages:", data);

          // API 응답 형태에 따라 안전하게 배열 추출
          const list = Array.isArray(data)
            ? data
            : Array.isArray(data.messages)
              ? data.messages
              : Array.isArray(data.result)
                ? data.result
                : [];
          setMessages(list);
        } else {
          setMessages([]);
        }
      } catch {
        console.error("대화 방 조회 오류");
        if (mounted) setMessages([]);
      }
    })();
    prevSelectedRef.current = selectedUser.user_id;

    return () => {
      mounted = false;
      if (roomId) {
        socket.emit("leave_room", roomId);
        setRoomId(null);
      }
    };
  }, [selectedUser?.user_id]); // user_id만 의존성으로

  useEffect(() => {
    const handleReceive = (message) => {
      if (!roomId) return;
      if (message.roomId && message.roomId !== roomId) return;
      if (
        message.sender_id === selectedUser?.user_id ||
        message.receiver_id === selectedUser?.user_id ||
        message.roomId === roomId
      ) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on("receive_message", handleReceive);
    return () => {
      socket.off("receive_message", handleReceive);
    };
  }, [selectedUser?.user_id, roomId]);

  const sendMessage = async () => {
    if (!content.trim()) {
      alert("빈 메시지는 보낼 수 없습니다.");
      return;
    }

    const message = {
      roomId,
      sender_id: currentUser.user_id,
      receiver_id: selectedUser.user_id,
      content,
    };

    try {
      // DB에 저장
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/messages/sendMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // 쿠키 포함
          body: JSON.stringify(message),
        }
      );

      if (!res.ok) {
        console.error("메시지 저장 실패:", res.status);
        alert("메시지 전송에 실패했습니다.");
        return;
      }

      // 저장 성공 후 실시간 전송
      socket.emit("send_message", message);

      // UI에 즉시 반영 (본인 메시지는 receive_message로 안 올 수 있음)
      setMessages((prev) => [...prev, message]);
      setContent("");
    } catch (err) {
      console.error("메시지 전송 실패", err);
      alert("메시지 전송에 실패했습니다.");
    }
  };

  if (!selectedUser)
    return (
      <div className="chat-window">
        <div className="chat-header">
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="empty-window">대화할 사용자를 선택하세요.</div>
      </div>
    );

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h3>{selectedUser.nick_name}</h3>
        <button className="close-button" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="message-box">
        {messages.length === 0 ? (
          <div className="no-message">메시지를 보내보세요</div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={
                msg.sender_id === currentUser.user_id ? "my-msg" : "their-msg"
              }
            >
              {msg.content}
            </div>
          ))
        )}
      </div>
      <div className="chat-input">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          placeholder="메시지 입력..."
        />
        <button onClick={sendMessage} disabled={!content.trim()}>
          전송
        </button>
      </div>
    </div>
  );
}
