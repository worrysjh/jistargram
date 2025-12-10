import { useState, useEffect } from "react";
import "styles/ProfilePage.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import { addFollowUser, removeFollowUser } from "actions/user/userActions";
import PostDetailModal from "components/posts/PostDetailModal";
import FollowListModal from "components/user/FollowListModal";
import { CiSettings } from "react-icons/ci";
import { FaPencilAlt } from "react-icons/fa";
import {
  fetchProfile,
  fetchMyPosts,
  fetchUserProfile,
  fetchUserPosts,
} from "actions/profile/profileActions";
import { fetchFollowStatus } from "actions/user/userActions";
import DeleteFollowerForm from "components/user/DeleteFollowerForm";

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteFollowId, setDeleteFollowId] = useState(null);
  const [followStatusData, setFollowStatusData] = useState(null);
  const [showFollowListModal, setShowFollowListModal] = useState(false);
  const [followListType, setFollowListType] = useState(null);

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const target_user_id = searchParams.get("user_id");

  const handleFollow = async (target_user_id) => {
    console.log("내용: ", followStatusData);
    try {
      if (followStatusData > 0) {
        // 언팔로우
        setDeleteFollowId(target_user_id);
        setShowDeleteModal(true);
        return;
      } else {
        // 팔로우
        await addFollowUser(target_user_id);
        setFollowStatusData(1);
      }
    } catch (err) {
      console.error(err);
      alert("팔로우 처리 중 오류가 발생했습니다.");
    }
  };

  const confirmUnfollow = async () => {
    try {
      if (!deleteFollowId) return;
      await removeFollowUser(deleteFollowId);
      setFollowStatusData(0);
      setShowDeleteModal(false);
      setDeleteFollowId(null);
    } catch (err) {
      console.error(err);
      alert("언팔로우 처리 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    (async () => {
      try {
        if (target_user_id) {
          const [profileData, postsData, followStatusRes] = await Promise.all([
            fetchUserProfile(target_user_id),
            fetchUserPosts(target_user_id),
            fetchFollowStatus(target_user_id),
          ]);
          console.log("내용2: ", followStatusData);
          setProfile(profileData);
          setMyPosts(postsData.posts.result);
          console.log("팔로우 상태 데이터:", followStatusRes);
          setFollowStatusData(followStatusRes.isFollowing ? 1 : 0);
          console.log("내용3: ", followStatusData);
        } else {
          // 프로필 + 내 게시물 동시 로드
          const [profileData, postsData] = await Promise.all([
            fetchProfile(navigate),
            fetchMyPosts(),
          ]);

          setProfile(profileData);
          setMyPosts(postsData.posts.result);
          setFollowStatusData(null);
        }
      } catch (err) {
        console.error("데이터 로딩 중 오류:", err);
      }
    })();
  }, [target_user_id, navigate]);

  if (!profile) return <p>로딩 중...</p>;

  const birthDate = new Date(profile.birthdate).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const openModal = (post) => {
    setSelectedPost(post);
    setShowDetailModal(true);
  };
  const closeModal = () => {
    setShowDetailModal(false);
    setSelectedPost(null);
  };

  const openFollowListModal = (type) => {
    setFollowListType(type);
    setShowFollowListModal(true);
  };

  const closeFollowListModal = () => {
    setShowFollowListModal(false);
    setFollowListType(null);
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-picture">
          <img
            src={
              profile.profile_img
                ? `${process.env.REACT_APP_API_URL}${profile.profile_img}`
                : "/common/img/사용자이미지.jpeg"
            }
            alt="프로필 이미지"
          />
        </div>
        <div className="profile-info">
          <div className="profile-top">
            <h2 className="profile-username">{profile.user_name}</h2>
            {target_user_id ? (
              <button
                className={`follow-button ${followStatusData > 0 ? "following" : ""}`}
                onClick={() => handleFollow(target_user_id)}
              >
                {followStatusData ? "팔로잉" : "팔로우"}
              </button>
            ) : (
              <button
                className="profile-button"
                onClick={() => navigate("/profile/edit")}
              >
                <FaPencilAlt title="프로필 수정" />
                프로필 편집
              </button>
            )}
            <span className="settings-icon">
              <CiSettings title="설정" />
            </span>
          </div>
          <ul className="profile-stats">
            <li>
              게시물 <b>{myPosts.length ? myPosts.length : "0"}</b>
            </li>
            <li onClick={() => openFollowListModal("followers")}>
              팔로워 <b>{profile.follower_count}</b>
            </li>
            <li onClick={() => openFollowListModal("following")}>
              팔로우 <b>{profile.following_count}</b>
            </li>
          </ul>
          <div className="profile-details">
            <span className="profile-user-nick-name">{profile.nick_name}</span>
            <p>생년월일: {birthDate}</p>
            <p>{profile.biography || "작성된 자기소개가 없습니다."}</p>
          </div>
        </div>
      </div>

      <hr />

      <div className="profile-posts">
        {myPosts.length > 0 ? (
          <div className="post-grid">
            {myPosts.map((post) => (
              <div
                key={post.post_id}
                className="post-item"
                onClick={() => openModal(post)}
              >
                <img
                  src={`${process.env.REACT_APP_API_URL}${post.media_url}`}
                  alt="post"
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="no-post">등록한 게시물이 없습니다.</p>
        )}
      </div>

      {showDetailModal && (
        <PostDetailModal post={selectedPost} onClose={closeModal} />
      )}
      {showDeleteModal && (
        <DeleteFollowerForm
          user={profile}
          onConfirm={confirmUnfollow}
          onCancel={() => {
            setShowDeleteModal(false);
            setDeleteFollowId(null);
          }}
        />
      )}
      {showFollowListModal && (
        <FollowListModal
          type={followListType}
          userId={target_user_id || profile.user_id}
          onClose={closeFollowListModal}
        />
      )}
    </div>
  );
}

export default ProfilePage;
