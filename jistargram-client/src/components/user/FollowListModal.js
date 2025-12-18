import { useState, useEffect, useRef, useCallback } from "react";
import "styles/FollowListModal.css";
import { authFetch } from "utils/authFetch";
import { addFollowUser, removeFollowUser } from "actions/user/userActions";
import { useNavigate } from "react-router-dom";
import { useModalScrollLock } from "utils/modalScrollLock";
import useAuthStore from "store/useAuthStore";

function FollowListModal({ type, userId, onClose }) {
  useModalScrollLock(true);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [limit, setLimit] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [isLast, setIsLast] = useState(false);
  const navigate = useNavigate();

  const loginUser = useAuthStore((state) => state.user);
  const loginUserId = loginUser?.user_id;

  const title = type === "followers" ? "팔로워" : "팔로우";

  const observer = useRef();

  const lastFollowRef = useCallback(
    (node) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !isLast) {
          setLimit((prev) => prev + 10);
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, isLast]
  );

  // 팔로워/팔로잉 목록 가져오기 (limit 변경 시마다 실행)
  useEffect(() => {
    const fetchFollowList = async () => {
      try {
        setIsLoading(true);
        const endpoint =
          type === "followers"
            ? `${process.env.REACT_APP_API_URL}/users/followerlists/${userId}?limit=${limit}`
            : `${process.env.REACT_APP_API_URL}/users/followinglists/${userId}?limit=${limit}`;

        const res = await authFetch(endpoint, { method: "GET" }, navigate);
        if (!res || !res.ok) throw new Error("목록 조회 실패");

        const data = await res.json();
        console.log("Fetched users:", data);

        const uniqueUsers = Array.from(
          new Map(data.map((u) => [u.user_id, u])).values()
        );

        // 접속 사용자 최상단으로 이동
        const processedUsers = uniqueUsers
          .map((u) => ({ ...u, isMe: u.user_id === loginUserId }))
          .sort((a, b) => (a.isMe === b.isMe ? 0 : a.isMe ? -1 : 1));

        setUsers(processedUsers);

        // 더 이상 데이터가 없으면 isLast를 true로
        if (processedUsers.length < limit) {
          setIsLast(true);
        }
      } catch (err) {
        console.error("팔로우 목록 조회 오류:", err);
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFollowList();
  }, [type, userId, limit, navigate]);

  // 검색 필터링
  useEffect(() => {
    if (!searchKeyword.trim()) {
      setFilteredUsers(users);
    } else {
      const keyword = searchKeyword.toLowerCase();
      const filtered = users.filter(
        (user) =>
          user.user_name.toLowerCase().includes(keyword) ||
          user.nick_name.toLowerCase().includes(keyword)
      );
      setFilteredUsers(filtered);
    }
  }, [searchKeyword, users]);

  // 팔로우/언팔로우 처리
  const handleFollowToggle = async (targetUser) => {
    try {
      if (targetUser.isFollowing) {
        await removeFollowUser(targetUser.user_id);
      } else {
        await addFollowUser(targetUser.user_id);
      }
      // 상태 업데이트
      setUsers((prev) =>
        prev.map((user) =>
          user.user_id === targetUser.user_id
            ? { ...user, isFollowing: !user.isFollowing }
            : user
        )
      );
    } catch (err) {
      console.error("팔로우 처리 오류:", err);
      alert("팔로우 처리 중 오류가 발생했습니다.");
    }
  };

  // 사용자 프로필로 이동
  const handleUserClick = (userId) => {
    onClose();
    navigate(`/profile?user_id=${userId}`);
  };

  // 모달 외부 클릭시 닫기
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="follow-list-modal-overlay" onClick={handleOverlayClick}>
      <div className="follow-list-modal">
        <div className="follow-list-modal-header">
          <h2>{title}</h2>
          <button className="follow-list-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="follow-list-search">
          <input
            type="text"
            placeholder="검색"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </div>

        <div className="follow-list-content">
          {isLoading && users.length === 0 ? (
            <div className="follow-list-loading">로딩 중...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="follow-list-empty">
              {searchKeyword ? "검색 결과가 없습니다." : "목록이 비어있습니다."}
            </div>
          ) : (
            <>
              {filteredUsers.map((user, index) => {
                const isLastItem = index === filteredUsers.length - 1;

                return (
                  <div
                    key={user.user_id}
                    className="follow-list-item"
                    ref={isLastItem ? lastFollowRef : null}
                  >
                    <div className="follow-list-avatar">
                      <img
                        src={
                          user.profile_img
                            ? `${process.env.REACT_APP_API_URL}${user.profile_img}`
                            : "/common/img/사용자이미지.jpeg"
                        }
                        alt={user.user_name}
                        onClick={() => handleUserClick(user.user_id)}
                      />
                    </div>
                    <div
                      className="follow-list-user-info"
                      onClick={() => handleUserClick(user.user_id)}
                    >
                      <p className="follow-list-username">{user.user_name}</p>
                      <p className="follow-list-nickname">{user.nick_name}</p>
                      {user.bio && (
                        <p className="follow-list-bio">{user.bio}</p>
                      )}
                    </div>
                    {!user.isMe && (
                      <button
                        className={`follow-list-action-btn ${user.isFollowing ? "following" : "follow"}`}
                        onClick={() => handleFollowToggle(user)}
                      >
                        {user.isFollowing ? "팔로잉" : "팔로우"}
                      </button>
                    )}
                  </div>
                );
              })}
              {isLoading && (
                <div className="follow-list-loading">추가 로딩 중...</div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default FollowListModal;
