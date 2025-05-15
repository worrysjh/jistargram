import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "../../styles/PostDetailModal.css";
import { getUserFromToken } from "../../utils/getUserFromToken";

import {
  fetchComments,
  addComment,
  deleteComment,
} from "../../actions/comment";

import { FcLike } from "react-icons/fc";
import { RiDislikeLine } from "react-icons/ri";

function PostDetailModal({ post, onClose }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const post_id = post.post_id;
  const currentUser = getUserFromToken();

  // 댓글 조회
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchComments(post_id);
        setComments(data);
      } catch (err) {
        console.error("댓글 로딩 실패:", err);
      }
    })();
  }, [post_id]);

  // 댓글 등록
  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    try {
      await addComment({
        post_id,
        comment_content: newComment,
        parent_id: null,
      });
      setNewComment("");
      const updated = await fetchComments(post_id);
      setComments(updated);
    } catch (err) {
      console.error("댓글 등록 에러:", err);
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (comment_id) => {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;
    try {
      await deleteComment(comment_id);
      const updated = await fetchComments(post_id);
      setComments(updated);
    } catch (err) {
      console.error("댓글 삭제 에러:", err);
    }
  };

  if (!post) return null;

  return ReactDOM.createPortal(
    <div className="detail-modal-overlay" onClick={onClose}>
      <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="detail-left">
          <img src={`http://localhost:4000${post.media_url}`} alt="게시물" />
        </div>
        <div className="detail-right">
          <div className="detail-header">
            <img
              src={
                post.profile_img
                  ? `http://localhost:4000${post.profile_img}`
                  : "/common/img/사용자이미지.jpeg"
              }
              alt="프로필"
              className="detail-profile-img"
            />
            <span className="detail-username">{post.user_name}</span>
            <button className="close-btn" onClick={onClose}>
              X
            </button>
          </div>

          <div className="detail-content">
            {post.content.split("\n").map((line, idx) => (
              <React.Fragment key={idx}>
                {line}
                <br />
              </React.Fragment>
            ))}
            <hr />
            <div className="comments">
              {comments.length > 0 ? (
                comments.map((c) => (
                  <p key={c.comment_id}>
                    <b>{c.user_name}</b>{" "}
                    {c.comment_state === "삭제" ? (
                      <span style={{ color: "gray", fontStyle: "italic" }}>
                        삭제된 댓글입니다.
                      </span>
                    ) : (
                      <>
                        {c.comment_content}
                        <br />
                        <RiDislikeLine />
                        <FcLike /> {c.created_at}
                        {currentUser?.user_id === c.user_id && (
                          <>
                            {" | "}
                            <span
                              onClick={() => handleDeleteComment(c.comment_id)}
                              style={{ color: "red", cursor: "pointer" }}
                            >
                              삭제
                            </span>
                          </>
                        )}
                      </>
                    )}
                  </p>
                ))
              ) : (
                <p style={{ color: "gray", fontStyle: "italic" }}>
                  아직 작성된 댓글이 없습니다...
                </p>
              )}
            </div>
          </div>

          <div className="detail-actions">
            <RiDislikeLine />
            <FcLike />
          </div>

          <div className="comment-input">
            <input
              type="text"
              placeholder="댓글 달기..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button onClick={handleCommentSubmit}>게시</button>
          </div>
        </div>
      </div>
    </div>,
    document.getElementById("modal-root")
  );
}

export default PostDetailModal;
