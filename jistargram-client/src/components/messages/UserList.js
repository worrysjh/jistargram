import { useRef, useCallback, useState, useEffect } from "react";
import "styles/MessageModal.css";
import { calculateDateDifference } from "utils/dateCalculate";

export default function UserList({
  rooms = [],
  selectedUser,
  onSelectUser,
  currentUser,
  onLoadMore,
  hasMore = true,
  isLoading = false,
}) {
  const observer = useRef();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filteredRooms, setFilteredRooms] = useState([]);

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

  // 검색 필터링
  useEffect(() => {
    if (!searchKeyword.trim()) {
      setFilteredRooms(rooms);
    } else {
      const keyword = searchKeyword.toLowerCase();
      const filtered = rooms.filter((user) =>
        user.nick_name?.toLowerCase().includes(keyword)
      );
      setFilteredRooms(filtered);
    }
  }, [searchKeyword, rooms]);

  return (
    <div className="message-user-list">
      <h3>{currentUser?.user_name}</h3>
      
      <div className="message-user-search">
        <input
          type="text"
          placeholder="사용자 검색"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          className="user-search-input"
        />
      </div>

      <div className="message-user-list-container">
        {filteredRooms.length === 0 && !isLoading ? (
          <div className="no-users">
            {searchKeyword ? "검색 결과가 없습니다" : "대화 가능한 사용자가 없습니다"}
          </div>
        ) : (
          <>
            {filteredRooms.map((user, index) => {
              const isLastItem = index === filteredRooms.length - 1;
              const unreadCount = parseInt(user.unread_count || 0);

              return (
                <div
                  key={user.room_id}
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
                    <p className="user-message-preview">
                      {user.last_message_content || "대화를 시작해보세요!"}
                    </p>
                    {unreadCount > 0 && (
                      <p className="user-unread-count">
                        새 메시지: {unreadCount}건
                      </p>
                    )}
                  </div>
                  {user.last_activity_at && (
                    <span className="user-time">
                      {calculateDateDifference(
                        user.last_activity_at,
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
