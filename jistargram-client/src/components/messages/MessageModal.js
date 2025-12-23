import { useState, useEffect, useCallback } from "react";
import UserList from "./UserList";
import ChatWindow from "./ChatWindow";
import { authFetch } from "utils/authFetch";
import { useNavigate } from "react-router-dom";
import { useModalScrollLock } from "utils/modalScrollLock";
import { socket } from "utils/socket";
import "styles/MessageModal.css";

export default function MessageModal({ onClose, initialTargetUser }) {
  useModalScrollLock(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [selectedUser, setSelectedUser] = useState(initialTargetUser || null);
  const [limit, setLimit] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const navigate = useNavigate();

  // 방 목록 새로고침 함수
  const refreshRoomList = useCallback(async () => {
    try {
      const chatUserListRes = await authFetch(
        `${process.env.REACT_APP_API_URL}/messages/expMessageRoomList`,
        {},
        navigate
      );

      if (!chatUserListRes || !chatUserListRes.ok) {
        console.error("failed to refresh room list");
        return;
      }

      const data = await chatUserListRes.json();
      console.log("=== 새로고침된 방 목록 ===", data);

      const roomList = Array.isArray(data)
        ? data
        : Array.isArray(data.users)
          ? data.users
          : Array.isArray(data.result)
            ? data.result
            : [];

      console.log("처리된 roomList:", roomList);
      roomList.forEach((room) => {
        console.log(
          `방: ${room.room_id}, 사용자: ${room.nick_name}, unread_count: ${room.unread_count}`
        );
      });

      setRooms(roomList);
    } catch (err) {
      console.error("Error refreshing room list:", err);
    }
  }, [navigate]);

  // 모든 방에 join (메시지 수신을 위해)
  useEffect(() => {
    if (!currentUser?.user_id || rooms.length === 0) return;

    console.log("[MessageModal] 모든 방에 join 시작");
    rooms.forEach((room) => {
      socket.emit("join_room", {
        roomId: room.room_id,
        userId: currentUser.user_id,
        partnerId: room.user_id,
      });
      console.log(`[MessageModal] 방 join: ${room.room_id} (상대: ${room.nick_name})`);
    });

    // cleanup: 모달이 언마운트될 때 모든 방에서 leave
    return () => {
      console.log("[MessageModal] 모든 방에서 leave 시작");
      rooms.forEach((room) => {
        socket.emit("leave_room", {
          room_id: room.room_id,
          user_id: currentUser.user_id,
        });
        console.log(`[MessageModal] 방 leave: ${room.room_id}`);
      });
    };
  }, [currentUser?.user_id, rooms.length]); // rooms 대신 rooms.length 사용하여 불필요한 재실행 방지

  // receive_message 이벤트 리스닝으로 실시간 room 목록 갱신
  useEffect(() => {
    const handleReceiveMessage = (message) => {
      console.log("[MessageModal] receive_message 수신:", message);
      
      // 현재 열려있는 방의 메시지가 아닌 경우에만 room 목록 새로고침
      // (현재 방의 메시지는 ChatWindow에서 처리하고 이미 읽음 처리됨)
      if (message.roomId !== currentRoomId) {
        console.log("[MessageModal] 다른 방에서 메시지 수신 - 목록 새로고침");
        refreshRoomList();
      } else {
        console.log("[MessageModal] 현재 방의 메시지 - 목록 새로고침 생략");
      }
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [refreshRoomList, currentRoomId]);

  // 현재 사용자 정보 + 초기 팔로잉 목록 조회
  useEffect(() => {
    let mounted = true;

    const fetchCurrentAndUsers = async () => {
      try {
        setIsLoading(true);
        const meRes = await authFetch(
          `${process.env.REACT_APP_API_URL}/users/me`,
          {},
          navigate
        );
        if (!meRes || !meRes.ok) {
          console.error("failed to fetch current user");
          if (mounted) {
            setCurrentUser(null);
            setRooms([]);
            setIsLoading(false);
          }
          return;
        }
        const me = await meRes.json();
        console.log("fetched current user:", me);
        if (!mounted) return;
        setCurrentUser(me);

        if (!me?.user_id) {
          setRooms([]);
          setIsLoading(false);
          return;
        }

        // 대화 가능한 사용자 목록 조회
        const chatUserListRes = await authFetch(
          `${process.env.REACT_APP_API_URL}/messages/expMessageRoomList`,
          {},
          navigate
        );

        if (!chatUserListRes || !chatUserListRes.ok) {
          console.error("failed to fetch users");
          if (mounted) {
            setRooms([]);
            setIsLoading(false);
          }
          return;
        }

        const data = await chatUserListRes.json();
        console.log("fetched users:", data);

        const roomList = Array.isArray(data)
          ? data
          : Array.isArray(data.users)
            ? data.users
            : Array.isArray(data.result)
              ? data.result
              : [];

        console.log("초기 roomList:", roomList);
        roomList.forEach((room) => {
          console.log(
            `방: ${room.room_id}, 사용자: ${room.nick_name}, unread_count: ${room.unread_count}`
          );
        });

        if (mounted) {
          setRooms(roomList);
          if (roomList.length < limit) {
            setHasMore(false);
          }
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error fetching current user or users:", err);
        if (mounted) {
          setCurrentUser(null);
          setRooms([]);
          setIsLoading(false);
        }
      }
    };

    fetchCurrentAndUsers();

    return () => {
      mounted = false;
    };
  }, [navigate, limit]);

  // initialTargetUser가 있으면 자동으로 선택
  useEffect(() => {
    if (initialTargetUser && currentUser) {
      console.log("[자동 선택] 타겟 유저:", initialTargetUser);
      setSelectedUser(initialTargetUser);
    }
  }, [initialTargetUser, currentUser]);

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      setLimit((prev) => prev + 10);
    }
  };

  // 사용자 선택 변경
  const handleSelectUser = (user) => {
    console.log(`[방 전환] 선택된 사용자:`, user);

    setSelectedUser(user);

    // 새 사용자 선택 후 방 목록 새로고침 (읽음 처리 반영)
    setTimeout(() => {
      console.log("[방 전환] 방 목록 새로고침 시작");
      refreshRoomList();
    }, 800);
  };

  // 모달 닫기
  const handleClose = () => {
    // 모든 방에서 leave_room
    if (currentUser?.user_id && rooms.length > 0) {
      console.log("[MessageModal] 모달 닫기 - 모든 방에서 leave");
      rooms.forEach((room) => {
        socket.emit("leave_room", {
          room_id: room.room_id,
          user_id: currentUser.user_id,
        });
        console.log(`[MessageModal] 방 leave: ${room.room_id}`);
      });
    }
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="chat-page" onClick={(e) => e.stopPropagation()}>
        <UserList
          rooms={rooms}
          selectedUser={selectedUser}
          onSelectUser={handleSelectUser}
          currentUser={currentUser}
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
          isLoading={isLoading}
        />
        <ChatWindow
          selectedUser={selectedUser}
          currentUser={currentUser}
          onClose={handleClose}
          onRoomChange={setCurrentRoomId}
          onRefreshRoomList={refreshRoomList}
        />
      </div>
    </div>
  );
}
