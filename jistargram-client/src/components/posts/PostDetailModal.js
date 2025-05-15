import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "../../styles/PostDetailModal.css";
import { getUserFromToken } from "../../utils/getUserFromToken";
import { authFetch } from "../../utils/authFetch";
import { fetchComments } from "../../actions/comment/fetchComments";
import { FcLike } from "react-icons/fc";

import { RiDislikeLine } from "react-icons/ri";

function PostDetailModal({ post, onClose }) {
  const [comments, setComments] = useState(null);
  const [newComment, setNewComment] = useState("");
  const post_id = post.post_id;

  const currentUser = getUserFromToken();

  useEffect(() => {
    const loadComments = async () => {
      const data = await fetchComments(post_id);
      if (data) setComments(data);
    };

    loadComments();
  }, [post_id]);

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;

    try {
      const res = await authFetch("http://localhost:4000/posts/newComment", {
        method: "POST",
        body: JSON.stringify({
          post_id: post.post_id,
          comment_content: newComment,
          parent_id: null,
        }),
      });

      if (!res.ok) throw new Error("댓글 등록 실패");

      setNewComment("");
      const updatedComments = await fetchComments(post.post_id);
      setComments(updatedComments);
    } catch (err) {
      console.error("댓글 등록 에러", err);
    }
  };

  const handleDeleteComment = async (comment_id) => {
    console.log("삭제 요청 comment_id : ", comment_id);
    const confirmDelete = window.confirm("댓글을 삭제하시겠습니까?");
    if (!confirmDelete) return;
    try {
      const res = await authFetch(
        `http://localhost:4000/posts/deleteComment/${comment_id}`,
        {
          method: "DELETE",
        }
      );
      alert("댓글이 삭제되었습니다.");
      if (!res.ok) throw new Error("댓글 삭제 실패");

      const updatedComments = await fetchComments(post_id);
      setComments(updatedComments);
    } catch (err) {
      console.error("댓글 삭제 중 에러", err);
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
                `http://localhost:4000${post.profile_img}` ||
                "/common/img/사용자이미지.jpeg"
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
            {post.content.split("\n").map((line, index) => (
              <React.Fragment key={index}>
                {line}
                <br />
              </React.Fragment>
            ))}
            <hr />
            <div className="comments">
              {Array.isArray(comments) && comments.length > 0 ? (
                comments.map((comment) => (
                  <p key={comment.comment_id}>
                    <b>{comment.user_name}</b>{" "}
                    {comment.comment_state === "삭제" ? (
                      <span style={{ color: "gray", fontStyle: "italic" }}>
                        삭제된 댓글입니다.
                      </span>
                    ) : (
                      <>
                        {comment.comment_content}
                        <br />
                        <RiDislikeLine />
                        <FcLike />
                        {comment.created_at} 좋아요:
                        {currentUser &&
                          currentUser.user_id === comment.user_id && (
                            <>
                              {" | "}
                              <span
                                onClick={() =>
                                  handleDeleteComment(comment.comment_id)
                                }
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
                <p>아직 작성된 댓글이 없습니다...</p>
              )}
            </div>
          </div>

          <div className="detail-actions">
            <RiDislikeLine />
            <FcLike />
          </div>

          <div className="comment-input">
            <input
              type="textarea"
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
