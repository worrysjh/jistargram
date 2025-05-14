import React, { useEffect, useState } from "react";
import { authFetch } from "../utils/authFetch";
import "../styles/PostPage.css";
import PostDetailModal from "../components/posts/PostDetailModal";
import { getUserFromToken } from "../utils/getUserFromToken";

import { FiMenu } from "react-icons/fi";

function PostPage() {
  const [posts, setPosts] = useState([]);
  const [expandedPosts, setExpandedPost] = useState({});
  const [selectedPost, setSelectedPost] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const currentUser = getUserFromToken();

  const [ownerMenuOpen, setOwnerMenuOpen] = useState(false);
  const toggleMenu = (post_id) => {
    setOwnerMenuOpen((prev) => (prev === post_id ? null : post_id));
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await authFetch("http://localhost:4000/posts/showPost");
        if (!res.ok) throw new Error("네트워크 응답 실패");

        const data = await res.json();
        setPosts(data);
      } catch (err) {
        console.error("게시글 로딩 실패", err);
      }
    };

    fetchPosts();
  }, []);

  const toggleExpand = (post_id) => {
    setExpandedPost((prev) => ({
      ...prev,
      [post_id]: !prev[post_id],
    }));
  };

  const handleOpenModal = (post) => {
    setSelectedPost(post);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedPost(null);
  };

  return (
    <>
      <div className="post-list">
        {posts.map((post) => {
          const lines = post.content.split("\n");
          const isLong = lines.length > 1;
          const isExpanded = expandedPosts[post.post_id];
          const isOwner = currentUser && currentUser.user_id === post.user_id;

          return (
            <div key={post.post_id} className="post-card">
              <div className="post-header">
                <img
                  src={
                    post.profile_img
                      ? `http://localhost:4000${post.profile_img}`
                      : "/common/img/사용자이미지.jpeg"
                  }
                  alt="프로필"
                  className="profile-pic"
                />
                <span className="username">{post.user_name}</span>
                {isOwner && (
                  <div className="owner-menu">
                    <div
                      className="hamburger"
                      onClick={() => toggleMenu(post.post_id)}
                    >
                      <FiMenu size={12} />
                    </div>
                    {ownerMenuOpen === post.post_id && (
                      <div className="owner-dropdown-menu">
                        <ul>
                          <li>수정하기</li>
                          <hr className="menu-divider" />
                          <li>삭제하기</li>
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <img
                src={
                  `http://localhost:4000${post.media_url}` ||
                  "/default-post.jpg"
                }
                alt="게시물"
                className="post-image"
              />

              <div className="post-caption">
                <strong>여기에 좋아요 버튼</strong>
                <br />
                <strong>좋아요 개</strong>
                <br />
                <strong>{post.user_name}</strong>{" "}
                {isExpanded ? (
                  <>
                    {lines.map((line, index) => (
                      <React.Fragment key={index}>
                        {line}
                        <br />
                      </React.Fragment>
                    ))}
                    {isLong && (
                      <span
                        onClick={() => toggleExpand(post.post_id)}
                        style={{ color: "gray", cursor: "pointer" }}
                      >
                        접기
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    {lines[0]}
                    {isLong && (
                      <span
                        onClick={() => toggleExpand(post.post_id)}
                        style={{ color: "gray", cursor: "pointer" }}
                      >
                        {" "}
                        ...더보기
                      </span>
                    )}
                  </>
                )}
              </div>

              <div className="divider" />
              <div className="comment-area">
                <span onClick={() => handleOpenModal(post)}>
                  댓글 개 모두 보기
                </span>
              </div>
            </div>
          );
        })}
      </div>
      {showDetailModal && (
        <PostDetailModal post={selectedPost} onClose={handleCloseModal} />
      )}
    </>
  );
}

export default PostPage;
