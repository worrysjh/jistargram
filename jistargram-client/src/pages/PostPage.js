import React, { useEffect, useState } from "react";
import PostDetailModal from "../components/posts/PostDetailModal";
import PostUpdateModal from "../components/posts/PostUpdateModal";
import LikeButton from "../components/common/LikeButton";
import { FiMenu } from "react-icons/fi";
import "../styles/PostPage.css";

import {
  fetchPosts,
  updatePost,
  deletePost,
} from "../actions/post/postActions";

function PostPage() {
  const [posts, setPosts] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [detailModal, setDetailModal] = useState({ open: false, post: null });
  const [updateModal, setUpdateModal] = useState({ open: false, post: null });
  const [menuOpenFor, setMenuOpenFor] = useState(null);

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchPosts();
        console.log("응답 확인 : ", data);
        setCurrentUser(data.user);
        setPosts(data.result);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const handleExpand = (id) => {
    setExpanded((e) => ({ ...e, [id]: !e[id] }));
  };

  const openDetail = (post) => setDetailModal({ open: true, post });
  const closeDetail = () => setDetailModal({ open: false, post: null });

  const openUpdate = (post) => setUpdateModal({ open: true, post });
  const closeUpdate = () => setUpdateModal({ open: false, post: null });

  const onUpdate = async (formData) => {
    try {
      const newContent = await updatePost(formData);
      setPosts((p) =>
        p.map((x) =>
          x.post_id === formData.get("post_id")
            ? { ...x, content: newContent }
            : x
        )
      );
      alert("수정 완료");
      closeUpdate();
    } catch {
      alert("수정 실패");
    }
  };

  const onDelete = async (post_id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deletePost(post_id);
      setPosts((p) => p.filter((x) => x.post_id !== post_id));
      alert("삭제 완료");
    } catch {
      alert("삭제 실패");
    }
  };

  const toggleMenu = (post_id) =>
    setMenuOpenFor((prev) => (prev === post_id ? null : post_id));

  return (
    <>
      <div className="post-list">
        {posts.map((post) => {
          const lines = post.content.split("\n");
          const long = lines.length > 1;
          const expandedHere = expanded[post.post_id];
          if (!currentUser) return <div>로딩 중...</div>;
          const isOwner = currentUser.user_id === post.user_id;

          return (
            <div key={post.post_id} className="post-card">
              {/* header */}
              <div className="post-header">
                <img
                  className="profile-pic"
                  src={
                    post.profile_img
                      ? `http://localhost:4000${post.profile_img}`
                      : "/common/img/사용자이미지.jpeg"
                  }
                  alt="프로필"
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
                    {menuOpenFor === post.post_id && (
                      <div className="owner-dropdown-menu">
                        <ul>
                          <li onClick={() => openUpdate(post)}>수정하기</li>
                          <hr className="menu-divider" />
                          <li onClick={() => onDelete(post.post_id)}>
                            삭제하기
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* image */}
              <img
                className="post-image"
                src={`http://localhost:4000${post.media_url}`}
                alt="게시물"
              />

              {/* caption */}
              <div className="post-caption">
                <LikeButton target_id={post.post_id} target_type="post" />
                <span className="post-owner-name">{post.user_name}</span>{" "}
                {expandedHere ? (
                  <>
                    {lines.map((l, i) => (
                      <React.Fragment key={i}>
                        {l}
                        <br />
                      </React.Fragment>
                    ))}
                    {long && (
                      <span
                        onClick={() => handleExpand(post.post_id)}
                        style={{
                          color: "gray",
                          cursor: "pointer",
                        }}
                      >
                        접기
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    {lines[0]}
                    {long && (
                      <span
                        onClick={() => handleExpand(post.post_id)}
                        style={{
                          color: "gray",
                          cursor: "pointer",
                        }}
                      >
                        …더보기
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* comments */}
              <div className="comment-divider" />
              <div className="comment-area">
                <span onClick={() => openDetail(post)}>
                  댓글 {post.comment_count}개 모두 보기
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {detailModal.open && (
        <PostDetailModal post={detailModal.post} onClose={closeDetail} />
      )}
      {updateModal.open && (
        <PostUpdateModal
          post={updateModal.post}
          onClose={closeUpdate}
          onUpdate={onUpdate}
          currentUser={currentUser}
        />
      )}
    </>
  );
}

export default PostPage;
