import React, { useEffect, useState, useRef, useCallback } from "react";
import { socket } from "utils/socket";
import "styles/MessageModal.css";
import {
  formatDate,
  formatTime,
  isSameDay,
  isSameSender,
} from "utils/dateConvertor";
import {
  checkMessageRoom,
  getMessages,
  sendMessageToServer,
  markMessagesAsRead,
} from "actions/message/messageAction";
import { getImageUrl } from "utils/imageUtils";

export default function ChatWindow({
  selectedUser,
  currentUser,
  onClose,
  onRoomChange,
  onRefreshRoomList,
}) {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [roomId, setRoomId] = useState(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = parseInt(process.env.REACT_APP_MESSAGE_LIMIT) || 20;

  const prevSelectedRef = useRef(null);
  const messageBoxRef = useRef(null);
  const shouldScrollRef = useRef(false);
  const isUserScrollingRef = useRef(false);
  const observer = useRef();
  const prevScrollHeightRef = useRef(0);

  // 메시지 목록 끝으로 스크롤
  const scrollToBottom = () => {
    if (messageBoxRef.current) {
      messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
    }
  };

  // 스크롤이 최하단에 있는지 확인
  const isAtBottom = () => {
    if (!messageBoxRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = messageBoxRef.current;
    return scrollHeight - scrollTop - clientHeight < 50;
  };

  // 이전 메시지 불러오기 - useCallback으로 감싸기
  const loadMoreMessages = useCallback(async () => {
    if (!roomId || isLoadingMessages || !hasMore) return;

    setIsLoadingMessages(true);
    const newOffset = offset + limit;

    try {
      const newMessages = await getMessages(
        selectedUser.user_id,
        newOffset,
        limit
      );

      if (newMessages.length < limit) {
        setHasMore(false);
      }

      if (newMessages.length > 0) {
        prevScrollHeightRef.current = messageBoxRef.current?.scrollHeight || 0;
        setMessages((prev) => [...newMessages, ...prev]);
        setOffset(newOffset);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("이전 메시지 로드 실패:", err);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [
    roomId,
    isLoadingMessages,
    hasMore,
    offset,
    selectedUser?.user_id,
    limit,
  ]);

  // 역방향 무한스크롤 - 첫 번째 메시지 관찰
  const firstMessageRef = useCallback(
    (node) => {
      if (isLoadingMessages) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !isLoadingMessages) {
            loadMoreMessages();
          }
        },
        {
          root: messageBoxRef.current,
          threshold: 0.1,
        }
      );

      if (node) observer.current.observe(node);
    },
    [isLoadingMessages, hasMore, loadMoreMessages]
  );

  // 메시지 로드 후 스크롤 위치 복원
  useEffect(() => {
    if (prevScrollHeightRef.current > 0 && messageBoxRef.current) {
      const currentScrollHeight = messageBoxRef.current.scrollHeight;
      const scrollDiff = currentScrollHeight - prevScrollHeightRef.current;
      messageBoxRef.current.scrollTop = scrollDiff;
      prevScrollHeightRef.current = 0;
    }
  }, [messages]);

  // 스크롤 이벤트 핸들러
  useEffect(() => {
    const messageBox = messageBoxRef.current;
    if (!messageBox) return;

    const handleScroll = () => {
      isUserScrollingRef.current = !isAtBottom();
    };

    messageBox.addEventListener("scroll", handleScroll);
    return () => messageBox.removeEventListener("scroll", handleScroll);
  }, []);

  // 메시지가 렌더링되면 스크롤
  useEffect(() => {
    if (shouldScrollRef.current && !isUserScrollingRef.current) {
      scrollToBottom();
      shouldScrollRef.current = false;
    }
  }, [messages, isLoadingMessages]);

  // roomId가 생성된 후에만 join
  useEffect(() => {
    if (!roomId || !currentUser?.user_id || !selectedUser?.user_id) {
      onRoomChange?.(null);
      return;
    }

    onRoomChange?.(roomId);
    socket.emit("join_room", {
      roomId: roomId,
      userId: currentUser.user_id,
      partnerId: selectedUser.user_id,
    });

    const handleMarkAsRead = async () => {
      try {
        await markMessagesAsRead(roomId, currentUser.user_id);
        setTimeout(() => {
          onRefreshRoomList?.();
        }, 300);
      } catch (err) {

      }
    };

    handleMarkAsRead();
  }, [roomId, currentUser?.user_id, onRefreshRoomList, onRoomChange, selectedUser?.user_id]);

  // 선택된 사용자 변경 시 초기화 및 메시지 로드
  useEffect(() => {
    if (!selectedUser?.user_id) {
      setRoomId(null);
      setMessages([]);
      setOffset(0);
      setHasMore(true);
      prevSelectedRef.current = null;
      setIsLoadingMessages(false);
      shouldScrollRef.current = false;
      isUserScrollingRef.current = false;
      return;
    }

    if (prevSelectedRef.current === selectedUser.user_id) {
      setRoomId(null);
      setMessages([]);
      setOffset(0);
      setHasMore(true);
      prevSelectedRef.current = selectedUser.user_id;
      setIsLoadingMessages(false);
      shouldScrollRef.current = false;
      isUserScrollingRef.current = false;
      return;
    }

    let mounted = true;
    setIsLoadingMessages(true);
    shouldScrollRef.current = false;
    setOffset(0);
    setHasMore(true);

    (async () => {
      try {
        const data = await checkMessageRoom(selectedUser.user_id);

        if (!mounted) return;

        if (data.exists && data.roomId) {
          setRoomId(data.roomId);

          const list = await getMessages(selectedUser.user_id, 0, limit);

          if (list.length < limit) {
            setHasMore(false);
          }

          if (mounted) {
            shouldScrollRef.current = true;
            setMessages(list);
            setIsLoadingMessages(false);
          }
        } else {
          if (mounted) {
            setRoomId(null);
            setMessages([]);
            setIsLoadingMessages(false);
          }
        }
      } catch (err) {
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
  }, [selectedUser?.user_id, limit]);

  // receive_message 핸들러
  useEffect(() => {
    const handleReceive = (message) => {

      // 현재 방의 메시지가 아니면 무시
      if (message.roomId !== roomId) {
        return;
      }

      // 자신이 보낸 메시지는 무시 (이미 낙관적 업데이트로 표시됨)
      if (message.sender_id === currentUser?.user_id) {
        return;
      }

      setMessages((prev) => {
        const newMessages = [...prev, message];

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
  }, [currentUser?.user_id, roomId]);

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

    const tempMessage = {
      ...messagePayload,
      message_id: `temp-${Date.now()}`,
      timestamp: new Date().toISOString(),
      roomId: roomId,
      isTemp: true,
    };

    isUserScrollingRef.current = false;
    shouldScrollRef.current = true;
    setMessages((prev) => [...prev, tempMessage]);
    setContent("");

    try {
      const result = await sendMessageToServer(messagePayload);

      const targetRoomId = result.room_id;

      if (!roomId && targetRoomId) {
        socket.emit("join_room", {
          roomId: targetRoomId,
          userId: currentUser.user_id,
          partnerId: selectedUser.user_id,
        });
        setRoomId(targetRoomId);
        await new Promise((resolve) => setTimeout(resolve, 150));
      }

      const { message_id, timestamp } = result.message || {};

      const confirmedMessage = {
        ...messagePayload,
        message_id: message_id,
        timestamp: timestamp,
        roomId: targetRoomId,
      };

      setMessages((prev) =>
        prev.map((msg) =>
          msg.message_id === tempMessage.message_id ? confirmedMessage : msg
        )
      );

      socket.emit("send_message", confirmedMessage);
    } catch (err) {
      setMessages((prev) =>
        prev.filter((msg) => msg.message_id !== tempMessage.message_id)
      );
      alert("메시지 전송에 실패했습니다.");
      setContent(messagePayload.content);
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
              src={getImageUrl(selectedUser.profile_img)}
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

      {isLoadingMessages && messages.length === 0 ? (
        <div className="message-box">
          <div className="user-list-loading">
            <div className="spinner"></div>
          </div>
        </div>
      ) : (
        <div className="message-box" ref={messageBoxRef}>
          {isLoadingMessages && messages.length > 0 && (
            <div className="loading-more">이전 메시지 불러오는 중...</div>
          )}
          {messages.map((msg, idx) => {
            const showDateDivider =
              idx === 0 ||
              !isSameDay(messages[idx - 1].timestamp, msg.timestamp);

            const nextMsg = messages[idx + 1];

            const showTime =
              !isSameSender(msg, nextMsg) ||
              (nextMsg && !isSameDay(msg.timestamp, nextMsg.timestamp));
            const isSent = msg.sender_id === currentUser?.user_id;
            const isFirstMessage = idx === 0;

            return (
              <React.Fragment key={msg.message_id || `msg-${idx}`}>
                {showDateDivider && (
                  <div className="date-divider">
                    <span className="date-divider-line"></span>
                    <span className="date-divider-text">
                      {formatDate(msg.timestamp)}
                    </span>
                    <span className="date-divider-line"></span>
                  </div>
                )}
                <div
                  className={`message-wrapper ${isSent ? "sent" : "received"}`}
                  ref={isFirstMessage && hasMore ? firstMessageRef : null}
                >
                  <div className={`message ${isSent ? "sent" : "received"}`}>
                    <p>{msg.content}</p>
                  </div>
                  {showTime && (
                    <span className="message-time">
                      {formatTime(msg.timestamp)}
                    </span>
                  )}
                </div>
              </React.Fragment>
            );
          })}
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
