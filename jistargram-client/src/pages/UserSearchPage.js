import React, { useState, useEffect } from "react";
import "../styles/UserSearchPage.css";

function UserSearchPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: API 호출하여 사용자 목록 가져오기
    // 예시 데이터
    const mockUsers = [
      {
        id: 1,
        username: "testuser1",
        fullname: "testuser1",
        bio: "@alien_gz님이 팔로우중입니다",
        profileImage: null,
        isFollowing: false,
      },
      {
        id: 2,
        username: "testuser2",
        fullname: "testuser2",
        bio: "",
        profileImage: null,
        isFollowing: false,
      },
      {
        id: 3,
        username: "testuser3",
        fullname: "testuser3",
        bio: "",
        profileImage: null,
        isFollowing: true,
      },
    ];

    setUsers(mockUsers);
    setLoading(false);
  }, []);

  const handleFollow = (userId) => {
    // TODO: 팔로우/언팔로우 API 호출
    console.log("Follow user:", userId);
  };

  if (loading) {
    return (
      <div className="user-search-container">
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="user-search-container">
      <div className="user-search-header">
        <h2>추천</h2>
      </div>

      <div className="user-list">
        {users.map((user) => (
          <div key={user.id} className="user-item">
            <div className="user-info">
              <div className="user-avatar">
                {user.profileImage ? (
                  <img src={user.profileImage} alt={user.username} />
                ) : (
                  <div className="default-avatar"></div>
                )}
              </div>

              <div className="user-details">
                <div className="username">{user.username}</div>
                <div className="user-fullname">{user.fullname}</div>
                {user.bio && <div className="user-bio">{user.bio}</div>}
              </div>
            </div>

            <button
              className={`follow-button ${user.isFollowing ? "following" : ""}`}
              onClick={() => handleFollow(user.id)}
            >
              {user.isFollowing ? "언팔로우" : "팔로우"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserSearchPage;
