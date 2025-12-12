import { useState, useEffect } from "react";
import "styles/FollowListModal.css";
import { authFetch } from "utils/authFetch";
import { addFollowUser, removeFollowUser } from "actions/user/userActions";
import { useNavigate } from "react-router-dom";
import { useModalScrollLock } from "utils/modalScrollLock";

function FollowListModal({ type, userId, onClose }) {
  useModalScrollLock(true);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const title = type === "followers" ? "팔로워" : "팔로우";

  // 팔로워/팔로잉 목록 가져오기
  useEffect(() => {
    const fetchFollowList = async () => {
      try {
        setLoading(true);
        const endpoint =
          type === "followers"
            ? `${process.env.REACT_APP_API_URL}/users/followerlists/${userId}`
            : `${process.env.REACT_APP_API_URL}/users/followinglists/${userId}`;

        const res = await authFetch(endpoint, { method: "GET" });
        if (!res.ok) throw new Error("목록 조회 실패");
        const data = await res.json();
        setUsers(data);
        setFilteredUsers(data);
      } catch (err) {
        console.error("팔로우 목록 조회 오류:", err);
        setUsers([]);
        setFilteredUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowList();
  }, [type, userId]);

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
          {loading ? (
            <div className="follow-list-loading">로딩 중...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="follow-list-empty">
              {searchKeyword ? "검색 결과가 없습니다." : "목록이 비어있습니다."}
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div key={user.user_id} className="follow-list-item">
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
                  {user.bio && <p className="follow-list-bio">{user.bio}</p>}
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default FollowListModal;
