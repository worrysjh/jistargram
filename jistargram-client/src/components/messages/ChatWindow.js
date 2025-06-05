import { useEffect, useState } from "react";
import { socket } from "../../utils/socket";
import "../../styles/MessageModal.css";

export default function ChatWindow({ selectedUser, currentUser, onClose }) {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");

  useEffect(() => {
    if (currentUser?.user_id) {
      socket.emit("join", currentUser.user_id);
      console.log("방 참가: ", currentUser.user_id);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!selectedUser) return;

    //fetch previous messages
    fetch(`${process.env.REACT_APP_API_URL}/messages/${selectedUser.user_id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setMessages(data));
  }, [selectedUser]);

  useEffect(() => {
    const handleReceive = (message) => {
      console.log("받은 메시지: ", message);
      setMessages((prev) => [...prev, message]);
    };

    socket.on("receive_message", handleReceive);
    return () => {
      socket.off("receive_message", handleReceive);
    };
  }, []);

  const sendMessage = async () => {
    if (!content.trim()) {
      alert("빈 메시지는 보낼 수 없습니다.");
      return;
    }
    const message = {
      sender_id: currentUser.user_id,
      receiver_id: selectedUser.user_id,
      content,
    };
    // 실시간 전송
    socket.emit("send_message", message);

    //DB 저장 요청
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/messages/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(message),
      });
    } catch (err) {
      console.error("메시지 저장 실패", err);
    }

    setMessages((prev) => [...prev, message]);
    setContent("");
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
        <h3>{selectedUser.nick_name} 님과의 대화</h3>
        <button className="close-button" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="message-box">
        {messages.length === 0 ? (
          <div className="no-message">대화 내역이 없습니다.</div>
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
          placeholder="메시지 입력..."
        />
        <button onClick={sendMessage}>보내기</button>
      </div>
    </div>
  );
}
