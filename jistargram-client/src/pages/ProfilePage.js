import React, { useState, useEffect } from "react";
import "../styles/ProfilePage.css";
import { useNavigate, useSearchParams } from "react-router-dom";

import PostDetailModal from "../components/posts/PostDetailModal";
import { CiSettings } from "react-icons/ci";
import { FaPencilAlt } from "react-icons/fa";

import {
  fetchProfile,
  fetchMyPosts,
  fetchUserProfile,
  fetchUserPosts,
} from "../actions/profile/profileActions";

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const target_user_id = searchParams.get("user_id");

  useEffect(() => {
    (async () => {
      try {
        if (target_user_id) {
          const [profileData, postsData] = await Promise.all([
            fetchUserProfile(target_user_id),
            fetchUserPosts(target_user_id),
          ]);

          setProfile(profileData);
          setMyPosts(postsData.posts.result);
        } else {
          // 프로필 + 내 게시물 동시 로드
          const [profileData, postsData] = await Promise.all([
            fetchProfile(navigate),
            fetchMyPosts(),
          ]);

          setProfile(profileData);
          setMyPosts(postsData.posts.result);
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
            <button
              className="profile-button"
              onClick={() => navigate("/profile/edit")}
            >
              <FaPencilAlt title="프로필 수정" />
            </button>
            <span className="settings-icon">
              <CiSettings title="설정" />
            </span>
          </div>
          <ul className="profile-stats">
            <li>
              게시물 <b>{myPosts.length ? myPosts.length : "0"}</b>
            </li>
            <li>
              팔로워 <b>0</b>
            </li>
            <li>
              팔로우 <b>0</b>
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
    </div>
  );
}

export default ProfilePage;
