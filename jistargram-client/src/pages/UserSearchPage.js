import { useState, useEffect } from "react";
import {
  fetchUserList,
  addFollowUser,
  removeFollowUser,
} from "actions/user/userActions";
import { Link } from "react-router-dom";
import "styles/UserSearchPage.css";
import DeleteFollowerForm from "components/user/DeleteFollowerForm";

function UserSearchPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [userToUnfollow, setUserToUnfollow] = useState(null);

  // 디바운스: search 값이 변경되고 1초 후에 debouncedSearch 업데이트
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  // 검색기능: debouncedSearch가 변경될 때만 API 호출
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    (async () => {
      try {
        const userData = await fetchUserList(debouncedSearch);
        if (mounted) setUsers(userData);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [debouncedSearch]);

  const handleSearchChange = (e) => {
    // 모든 경우에 즉시 입력값 반영 (화면에 표시)
    setSearch(e.target.value);
  };

  const handleClear = () => {
    setSearch("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const handleFollow = async (userId, isFollowing) => {
    try {
      if (isFollowing) {
        const user = users.find((u) => u.user_id === userId);
        setUserToUnfollow(user);
      } else {
        await addFollowUser(userId);
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.user_id === userId
              ? { ...user, isFollowing: !isFollowing }
              : user
          )
        );
      }
    } catch (err) {
      console.error(err);
      alert("팔로우 처리 중 오류가 발생했습니다.");
    }
  };

  const handleConfirmUnfollow = async () => {
    if (!userToUnfollow) return;

    try {
      await removeFollowUser(userToUnfollow.user_id);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.user_id === userToUnfollow.user_id
            ? { ...user, isFollowing: false }
            : user
        )
      );
      setUserToUnfollow(null);
    } catch (err) {
      console.error(err);
      alert("팔로우 취소에 실패했습니다.");
    }
  };

  const handleCancelUnfollow = () => {
    setUserToUnfollow(null);
  };

  const isTyping = search !== debouncedSearch;

  return (
    <div className="user-search-container">
      <div className="user-search-header">
        <h2>사용자 검색</h2>

        <form className="search-form" onSubmit={handleSubmit}>
          <input
            className="search-input"
            type="text"
            placeholder="닉네임, ID 검색"
            value={search}
            onChange={handleSearchChange}
            aria-label="사용자 검색"
          />
          {search && (
            <button
              type="button"
              className="clear-button"
              onClick={handleClear}
              aria-label="검색 지우기"
            >
              ×
            </button>
          )}
        </form>
      </div>

      <div className="user-list">
        {loading || isTyping ? (
          <div className="loading" role="status" aria-live="polite">
            <span className="spinner" aria-hidden="true"></span>
          </div>
        ) : users.length === 0 ? (
          <div className="no-results">검색된 결과가 없습니다.</div>
        ) : (
          users.map((user) => (
            <div key={user.user_id} className="user-item">
              <Link
                to={`/profile?user_id=${user.user_id}`}
                className="user-link"
              >
                <div className="user-info">
                  <div className="user-avatar">
                    {user.profile_img ? (
                      <img
                        src={`${process.env.REACT_APP_API_URL}${user.profile_img}`}
                        alt={user.user_name}
                      />
                    ) : (
                      <div className="default-avatar"></div>
                    )}
                  </div>

                  <div className="user-details">
                    <div className="username">{user.user_name}</div>
                    <div className="user-nickname">{user.nick_name}</div>
                    {user.biography && (
                      <div className="user-bio">{user.biography}</div>
                    )}
                  </div>
                </div>
              </Link>

              <button
                className={`follow-button ${user.isFollowing ? "following" : ""}`}
                onClick={() => handleFollow(user.user_id, user.isFollowing)}
              >
                {user.isFollowing ? "팔로잉" : "팔로우"}
              </button>
            </div>
          ))
        )}
      </div>

      {userToUnfollow && (
        <DeleteFollowerForm
          user={userToUnfollow}
          onConfirm={handleConfirmUnfollow}
          onCancel={handleCancelUnfollow}
        />
      )}
    </div>
  );
}

export default UserSearchPage;
