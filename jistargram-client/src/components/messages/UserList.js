import "styles/MessageModal.css";
import { calculateDateDifference } from "utils/dateCalculate";

export default function UserList({
  users = [],
  selectedUser,
  onSelectUser,
  currentUser,
}) {
  return (
    <div className="message-user-list">
      <h3>{currentUser?.user_name}</h3>
      <div className="message-user-list-container">
        {users.length === 0 ? (
          <div className="no-users">대화 가능한 사용자가 없습니다</div>
        ) : (
          users.map((user) => (
            <div
              key={user.user_id}
              className={`user-item ${selectedUser?.user_id === user.user_id ? "active" : ""}`}
              onClick={() =>
                onSelectUser(
                  selectedUser?.user_id === user.user_id ? null : user
                )
              }
            >
              {user.profile_img ? (
                <img
                  src={`${process.env.REACT_APP_API_URL}${user.profile_img}`}
                  alt={user.nick_name}
                  className="user-avatar"
                />
              ) : (
                <div className="user-avatar-placeholder">
                  {user.nick_name?.charAt(0) || "?"}
                </div>
              )}
              <div className="message-user-info">
                <p className="user-name">{user.nick_name}</p>
                {/* TODO: 안읽은 메시지? */}
                <p
                  className={`user-message-preview ${user.unread ? "unread" : ""}`}
                >
                  {user.last_message || "대화를 시작해보세요!"}
                </p>
              </div>
              {/* TODO: 마지막 메시지 시간 */}
              {user.last_message_time && (
                <span className="user-time">
                  {calculateDateDifference(user.last_message_time, new Date())}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
