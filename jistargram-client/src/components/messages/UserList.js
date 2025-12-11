import "../../styles/MessageModal.css";

export default function UserList({ users = [], selectedUser, onSelectUser }) {
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return "방금";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}분`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}시간`;
    return `${Math.floor(diff / 86400000)}일`;
  };

  return (
    <div className="user-list">
      <h3>메시지</h3>
      <div className="user-list-container">
        {users.length === 0 ? (
          <div className="no-users">대화 가능한 사용자가 없습니다</div>
        ) : (
          users.map((user) => (
            <div
              key={user.user_id}
              className={`user-item ${selectedUser?.user_id === user.user_id ? "active" : ""}`}
              onClick={() => onSelectUser(user)}
            >
              {user.profile_image ? (
                <img
                  src={user.profile_image}
                  alt={user.nick_name}
                  className="user-avatar"
                />
              ) : (
                <div className="user-avatar-placeholder">
                  {user.nick_name?.charAt(0) || "?"}
                </div>
              )}
              <div className="user-info">
                <p className="user-name">{user.nick_name}</p>
                <p
                  className={`user-message-preview ${user.unread ? "unread" : ""}`}
                >
                  {user.last_message || "메시지를 보내보세요"}
                </p>
              </div>
              {user.last_message_time && (
                <span className="user-time">
                  {formatTime(user.last_message_time)}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
