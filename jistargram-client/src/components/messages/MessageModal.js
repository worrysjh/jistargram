import { useState, useEffect } from "react";
import UserList from "./UserList";
import ChatWindow from "./ChatWindow";
import { authFetch } from "utils/authFetch";
import { useNavigate } from "react-router-dom";
import { useModalScrollLock } from "utils/modalScrollLock";
import "styles/MessageModal.css";

export default function MessageModal({ onClose }) {
  useModalScrollLock(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [limit, setLimit] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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
            setUsers([]);
            setIsLoading(false);
          }
          return;
        }
        const me = await meRes.json();
        console.log("fetched current user:", me);
        if (!mounted) return;
        setCurrentUser(me);

        if (!me?.user_id) {
          setUsers([]);
          setIsLoading(false);
          return;
        }

        const chatUserListRes = await authFetch(
          `${process.env.REACT_APP_API_URL}/messages/expMessageRoomList`,
          {},
          navigate
        );

        if (!chatUserListRes || !chatUserListRes.ok) {
          console.error("failed to fetch users");
          if (mounted) {
            setUsers([]);
            setIsLoading(false);
          }
          return;
        }

        const data = await chatUserListRes.json();
        console.log("fetched users:", data);

        const userList = Array.isArray(data)
          ? data
          : Array.isArray(data.users)
            ? data.users
            : Array.isArray(data.result)
              ? data.result
              : [];

        if (mounted) {
          setUsers(userList);
          // 받아온 데이터가 limit보다 적으면 더 이상 없음
          if (userList.length < limit) {
            setHasMore(false);
          }
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error fetching current user or users:", err);
        if (mounted) {
          setCurrentUser(null);
          setUsers([]);
          setIsLoading(false);
        }
      }
    };

    fetchCurrentAndUsers();

    return () => {
      mounted = false;
    };
  }, [navigate, limit]);

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      setLimit((prev) => prev + 10);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="chat-page" onClick={(e) => e.stopPropagation()}>
        <UserList
          users={users}
          selectedUser={selectedUser}
          onSelectUser={setSelectedUser}
          currentUser={currentUser}
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
          isLoading={isLoading}
        />
        <ChatWindow
          selectedUser={selectedUser}
          currentUser={currentUser}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
