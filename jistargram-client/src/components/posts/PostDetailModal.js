import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "../../styles/PostDetailModal.css";
import { authFetch } from "../../utils/authFetch";
import { fetchComments } from "../../actions/comment/fetchComments";

function PostDetailModal({ post, onClose }) {
  const [comments, setComments] = useState(null);
  const [newComment, setNewComment] = useState(null);
  const post_id = post.post_id;

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
      fetchComments();
    } catch (err) {
      console.error("댓글 등록 에러", err);
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
                    <b>{comment.user_name}</b> {comment.comment_content}
                    <br />
                    {comment.created_at} 좋아요: | 답글
                  </p>
                ))
              ) : (
                <p>아직 작성된 댓글이 없습니다...</p>
              )}
            </div>
          </div>

          <div className="detail-actions">{post.post_id}여기에 좋아요...</div>

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
