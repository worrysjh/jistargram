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
  }, [navigate, setCurrentUser]);

  const modalContent = (
    <div className="modal-backdrop">
      <div className="chat-page">
        <UserList onSelectUser={setSelectedUser} currentUser={currentUser} />
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
