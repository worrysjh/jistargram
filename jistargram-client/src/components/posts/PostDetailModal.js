import React from "react";
import ReactDOM from "react-dom";
import "../../styles/PostDetailModal.css";

function PostDetailModal({ post, onClose }) {
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
              <p>
                <b>user1</b> 테스트중
              </p>
              <p>
                <b>user2</b> 너무 멋져요!
              </p>
            </div>
          </div>

          <div className="detail-actions">여기에 좋아요...</div>

          <div className="comment-input">
            <input type="text" placeholder="댓글 달기..." />
            <button>게시</button>
          </div>
        </div>
      </div>
    </div>,
    document.getElementById("modal-root")
  );
}

export default PostDetailModal;
