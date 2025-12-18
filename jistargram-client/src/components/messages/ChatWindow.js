import { useEffect, useState, useRef } from "react";
import { socket } from "utils/socket";
import "styles/MessageModal.css";

export default function ChatWindow({ selectedUser, currentUser, onClose }) {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [roomId, setRoomId] = useState(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const prevSelectedRef = useRef(null);
  const messageBoxRef = useRef(null);
  const shouldScrollRef = useRef(false);
  const isUserScrollingRef = useRef(false);

  // 메시지 목록 끝으로 스크롤
  const scrollToBottom = () => {
    if (messageBoxRef.current) {
      messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
    }
  };

  // 스크롤이 최하단에 있는지 확인
  const isAtBottom = () => {
    if (!messageBoxRef.current) return false;
    const { scrollTop, scrollHeight, clientHeight } = messageBoxRef.current;
    return scrollHeight - scrollTop - clientHeight < 50;
  };

  // 스크롤 이벤트 핸들러
  useEffect(() => {
    const handleScroll = () => {
      isUserScrollingRef.current = !isAtBottom();
    };

    const messageBox = messageBoxRef.current;
    if (messageBox) {
      messageBox.addEventListener("scroll", handleScroll);
      return () => messageBox.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // 메시지가 렌더링되면 스크롤
  useEffect(() => {
    if (shouldScrollRef.current && !isLoadingMessages && messages.length > 0) {
      scrollToBottom();
      shouldScrollRef.current = false;
      isUserScrollingRef.current = false;
    }
  }, [messages, isLoadingMessages]);

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
      setIsLoadingMessages(false);
      shouldScrollRef.current = false;
      isUserScrollingRef.current = false;
      return;
    }

    // 재선택 시 선택 해제
    if (prevSelectedRef.current === selectedUser.user_id) {
      setRoomId(null);
      setMessages([]);
      prevSelectedRef.current = selectedUser.user_id;
      setIsLoadingMessages(false);
      shouldScrollRef.current = false;
      isUserScrollingRef.current = false;
      return;
    }

    let mounted = true;
    setIsLoadingMessages(true);
    shouldScrollRef.current = false;

    (async () => {
      try {
        // 1. 방 존재 여부 확인 (roomId는 서버에서 계산해서 반환)
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/messages/checkMessageRoom/${selectedUser.user_id}`,
          { credentials: "include" }
        );

        if (!res.ok) {
          console.error("대화 방 확인 실패, status:", res.status);
          if (mounted) {
            setMessages([]);
            setIsLoadingMessages(false);
          }
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
            if (mounted) {
              shouldScrollRef.current = true;
              setMessages(list);
              setIsLoadingMessages(false);
            }
            console.log("기존 메시지 불러오기 성공:", list);
          } else {
            console.error("메시지 조회 실패:", msgRes.status);
            if (mounted) {
              setMessages([]);
              setIsLoadingMessages(false);
            }
          }
        } else {
          // 방이 없으면 메시지 비우기 (최초 메시지 전송 시 생성됨)
          if (mounted) {
            setRoomId(null);
            setMessages([]);
            setIsLoadingMessages(false);
          }
        }
      } catch (err) {
        console.error("대화 방 조회 오류:", err);
        if (mounted) {
          setMessages([]);
          setIsLoadingMessages(false);
        }
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

      // 내가 보낸 메시지는 이미 UI에 추가했으므로 무시
      if (message.sender_id === currentUser?.user_id) {
        return;
      }

      setMessages((prev) => {
        const newMessages = [...prev, message];

        // 스크롤이 최하단에 있으면 자동 스크롤
        if (!isUserScrollingRef.current) {
          setTimeout(() => scrollToBottom(), 0);
        }

        return newMessages;
      });
    };

    socket.on("receive_message", handleReceive);
    return () => {
      socket.off("receive_message", handleReceive);
    };
  }, [currentUser?.user_id]);

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

      const result = await res.json();
      console.log("메시지 저장 성공:", result);

      const targetRoomId = result.room_id;

      // 2. 최초 전송인 경우 즉시 방 입장
      if (!roomId && targetRoomId) {
        console.log("최초 메시지 - Room 즉시 참가: ", targetRoomId);
        socket.emit("join_room", targetRoomId);
        setRoomId(targetRoomId);

        // 방 입장 처리 시간 대기
        await new Promise((resolve) => setTimeout(resolve, 150));
      }

      // 3. 즉시 메시지를 UI에 추가 (낙관적 업데이트)
      const newMessage = {
        ...messagePayload,
        message_id: result.message_id,
        timestamp: result.timestamp,
        roomId: targetRoomId,
      };

      setMessages((prev) => [...prev, newMessage]);

      // 4. 소켓으로 메시지 전송 (다른 사용자에게 전달)
      socket.emit("send_message", newMessage);
      console.log("메시지 소켓 전송:", newMessage);

      setContent("");

      // 메시지 전송 시 항상 스크롤
      isUserScrollingRef.current = false;
      setTimeout(() => scrollToBottom(), 0);
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

      {isLoadingMessages ? (
        <div className="message-box">
          <div className="user-list-loading">
            <div className="spinner"></div>
          </div>
        </div>
      ) : (
        <div className="message-box" ref={messageBoxRef}>
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
      )}

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
