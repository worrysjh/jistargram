import { useRef, useCallback } from "react";
import "styles/MessageModal.css";
import { calculateDateDifference } from "utils/dateCalculate";

export default function UserList({
  users = [],
  selectedUser,
  onSelectUser,
  currentUser,
  onLoadMore,
  hasMore = true,
  isLoading = false,
}) {
  const observer = useRef();

  const lastUserRef = useCallback(
    (node) => {
      if (isLoading) return;
      if (!hasMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            onLoadMore?.();
          }
        },
        {
          rootMargin: "0px 0px 100px 0px",
          threshold: 0.1,
        }
      );

      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore, onLoadMore]
  );

  return (
    <div className="message-user-list">
      <h3>{currentUser?.user_name}</h3>
      <div className="message-user-list-container">
        {users.length === 0 && !isLoading ? (
          <div className="no-users">대화 가능한 사용자가 없습니다</div>
        ) : (
          <>
            {users.map((user, index) => {
              const isLastItem = index === users.length - 1;

              return (
                <div
                  key={user.user_id}
                  ref={isLastItem ? lastUserRef : null}
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
                    <p
                      className={`user-message-preview ${user.unread ? "unread" : ""}`}
                    >
                      {user.last_message || "대화를 시작해보세요!"}
                    </p>
                  </div>
                  {user.last_message_time && (
                    <span className="user-time">
                      {calculateDateDifference(
                        user.last_message_time,
                        new Date()
                      )}
                    </span>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="user-list-loading">
                <div className="spinner"></div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
