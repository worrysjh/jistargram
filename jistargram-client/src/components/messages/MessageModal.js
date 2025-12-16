import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "styles/MessageModal.css";
import { authFetch } from "utils/authFetch";
import { useNavigate } from "react-router-dom";
import UserList from "./UserList";
import ChatWindow from "./ChatWindow";
import { useModalScrollLock } from "utils/modalScrollLock";

function MessageModal({ onClose, onSubmit }) {
  useModalScrollLock(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const fetchCurrentAndUsers = async () => {
      try {
        // 1) 현재 사용자 조회
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
          }
          return;
        }
        const me = await meRes.json();
        console.log("fetched current user:", me);
        if (!mounted) return;
        setCurrentUser(me);

        // 2) 팔로잉 목록 조회 (user_id가 있을 때만)
        if (!me?.user_id) {
          setUsers([]);
          return;
        }

        const followRes = await authFetch(
          `${process.env.REACT_APP_API_URL}/users/followinglists/${me.user_id}`,
          {},
          navigate
        );

        if (!followRes || !followRes.ok) {
          console.error("failed to fetch users");
          if (mounted) setUsers([]);
          return;
        }

        const data = await followRes.json();
        console.log("fetched users:", data);

        const userList = Array.isArray(data)
          ? data
          : Array.isArray(data.users)
            ? data.users
            : Array.isArray(data.result)
              ? data.result
              : [];

        if (mounted) setUsers(userList);
      } catch (err) {
        console.error("Error fetching current user or users:", err);
        if (mounted) {
          setCurrentUser(null);
          setUsers([]);
        }
      }
    };

    fetchCurrentAndUsers();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const modalContent = (
    <div className="modal-backdrop">
      <div className="chat-page">
        <UserList
          users={users}
          selectedUser={selectedUser}
          onSelectUser={setSelectedUser}
          currentUser={currentUser}
        />
        <ChatWindow
          selectedUser={selectedUser}
          currentUser={currentUser}
          onClose={onClose}
        />
      </div>
    </div>
  );

  return ReactDOM.createPortal(
    modalContent,
    document.getElementById("modal-root")
  );
}

export default MessageModal;
