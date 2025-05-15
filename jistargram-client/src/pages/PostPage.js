import React, { useEffect, useState } from "react";
import { authFetch } from "../utils/authFetch";
import "../styles/PostPage.css";
import PostDetailModal from "../components/posts/PostDetailModal";
import { getUserFromToken } from "../utils/getUserFromToken";

import { FcLike } from "react-icons/fc";
import { RiDislikeLine } from "react-icons/ri";
import { FiMenu } from "react-icons/fi";
import PostUpdateModal from "../components/posts/PostUpdateModal";

function PostPage() {
  const [posts, setPosts] = useState([]);
  const [expandedPosts, setExpandedPost] = useState({});
  const [selectedPost, setSelectedPost] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [postToUpdate, setPostToUpdate] = useState(null);

  const onOpenPostUpdateModal = (post) => {
    setPostToUpdate(post);
    setShowUpdateModal(true);
  };
  const onClosePostUpdateModal = () => {
    setShowUpdateModal(false);
    setPostToUpdate(null);
  };
  const handlePostUpdate = async (formData) => {
    const post_id = formData.get("post_id");
    try {
      const res = await authFetch(
        `http://localhost:4000/posts/updatePost/${post_id}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!res.ok) throw new Error("수정 실패");

      const updatedContent = formData.get("content");
      const updatedPosts = posts.map((p) =>
        p.post_id === post_id ? { ...p, content: updatedContent } : p
      );
      setPosts(updatedPosts);
      alert("게시글이 수정되었습니다.");
      return true;
    } catch (err) {
      console.error("게시글 수정 중 오류", err);
      alert("게시글 수정 실패");
      return false;
    }
  };

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

  const handleDelete = async (post_id) => {
    const confirmDelete = window.confirm("정말로 삭제하시겠습니까?");
    if (!confirmDelete) return;

    try {
      const res = await authFetch(
        `http://localhost:4000/posts/deletePost/${post_id}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) throw new Error("삭제 실패");

      alert("게시글이 삭제되었습니다.");
      setPosts((prev) => prev.filter((post) => post.post_id !== post_id));
    } catch (err) {
      console.error("삭제 요청 실패:", err);
      alert("게시글 삭제 중 오류가 발생했습니다.");
    }
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
                          <li onClick={() => onOpenPostUpdateModal(post)}>
                            수정하기
                          </li>
                          <hr className="menu-divider" />
                          <li onClick={() => handleDelete(post.post_id)}>
                            삭제하기
                          </li>
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
                <strong>
                  <RiDislikeLine />
                  <FcLike />
                </strong>
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

              <div className="comment-divider" />
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
      {showUpdateModal && (
        <PostUpdateModal
          post={postToUpdate}
          onClose={onClosePostUpdateModal}
          onUpdate={handlePostUpdate}
        />
      )}
    </>
  );
}

export default PostPage;
