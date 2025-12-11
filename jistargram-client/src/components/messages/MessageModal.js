import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "../../styles/MessageModal.css";
import { authFetch } from "../../utils/authFetch";
import { useNavigate } from "react-router-dom";
import UserList from "./UserList";
import ChatWindow from "./ChatWindow";

function MessageModal({ onClose, onSubmit }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const res = await authFetch(
        `${process.env.REACT_APP_API_URL}/users/me`,
        {},
        navigate
      );

      if (res && res.ok) {
        const user = await res.json();
        setCurrentUser(user);
      } else {
        console.error("failed to fetch current user");
      }
    };
    fetchCurrentUser();
  }, [navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await authFetch(
          `${process.env.REACT_APP_API_URL}/messages/users`,
          {},
          navigate
        );

        if (res && res.ok) {
          const data = await res.json();
          console.log("fetched users:", data);

          // API 응답 형태에 따라 안전하게 배열 추출
          const userList = Array.isArray(data)
            ? data
            : Array.isArray(data.users)
              ? data.users
              : Array.isArray(data.result)
                ? data.result
                : [];

          setUsers(userList);
        } else {
          console.error("failed to fetch users");
          setUsers([]);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        setUsers([]);
      }
    };

    fetchUsers();
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
