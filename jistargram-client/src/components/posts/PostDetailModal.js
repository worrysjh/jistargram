import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "../../styles/PostDetailModal.css";
import { getUserFromToken } from "../../utils/getUserFromToken";

import {
  addComment,
  deleteComment,
} from "../../actions/comment/commentActions";

import { fetchAndFlattenComments } from "../../utils/commentUtils";

import LikeButton from "../common/LikeButton";

function PostDetailModal({ post, onClose }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyContent, setReplyContent] = useState("");

  const post_id = post.post_id;
  const post_created_at = post.created_at;
  const currentUser = getUserFromToken();

  // 댓글 조회
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchAndFlattenComments(post_id);
        setComments(data);
      } catch (err) {
        console.error("댓글 로딩 실패:", err);
      }
    })();
  }, [post_id]);

  // 새 댓글 등록
  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    try {
      await addComment({
        post_id,
        comment_content: newComment,
        parent_id: null,
      });
      setNewComment("");
      const data = await fetchAndFlattenComments(post_id);
      setComments(data);
    } catch (err) {
      console.error("댓글 등록 에러:", err);
    }
  };

  // 답글 등록
  const handleReplySubmit = async () => {
    if (!replyContent.trim()) return;
    try {
      await addComment({
        post_id,
        comment_content: replyContent,
        parent_id: replyTarget,
      });
      setReplyContent("");
      setReplyTarget(null);
      const data = await fetchAndFlattenComments(post_id);
      setComments(data);
    } catch (err) {
      console.error("답글 등록 에러:", err);
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (comment_id) => {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;
    try {
      await deleteComment(comment_id);
      const data = await fetchAndFlattenComments(post_id);
      setComments(data);
    } catch (err) {
      console.error("댓글 삭제 에러:", err);
    }
  };

  if (!post) return null;

  return ReactDOM.createPortal(
    <div className="detail-modal-overlay" onClick={onClose}>
      <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* 좌측 이미지 */}
        <div className="detail-left">
          <img src={`http://localhost:4000${post.media_url}`} alt="게시물" />
        </div>
        {/* 우측 콘텐츠 */}
        <div className="detail-right">
          {/* 헤더 */}
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

          {/* 본문 + 댓글 목록 */}
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
                  <div
                    key={c.comment_id}
                    className={`comment-block${c.parent_id ? " reply-comment" : ""}`}
                  >
                    <p>
                      <b>{c.user_name}</b>{" "}
                      {c.comment_state === "삭제" ? (
                        <span style={{ color: "gray", fontStyle: "italic" }}>
                          삭제된 댓글입니다.
                        </span>
                      ) : (
                        <>
                          {c.comment_content}
                          <LikeButton
                            target_id={c.comment_id}
                            target_type="comment"
                          />
                          <small className="comment-date">
                            {new Date(c.created_at).toLocaleString("ko-KR")}
                          </small>
                          {" | "}
                          <span
                            className="comment-action reply-text"
                            onClick={() =>
                              setReplyTarget((prev) =>
                                prev === c.comment_id ? null : c.comment_id
                              )
                            }
                          >
                            답글
                          </span>
                          {currentUser?.user_id === c.user_id && (
                            <>
                              {" | "}
                              <span
                                className="comment-action delete-text"
                                onClick={() =>
                                  handleDeleteComment(c.comment_id)
                                }
                              >
                                삭제
                              </span>
                            </>
                          )}
                        </>
                      )}
                    </p>

                    {/* replyTarget과 맞을 때만 렌더링 */}
                    {replyTarget === c.comment_id && (
                      <div className="reply-input">
                        <input
                          type="text"
                          placeholder="답글 달기..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                        />
                        <button onClick={handleReplySubmit}>등록</button>
                        <button onClick={() => setReplyTarget(null)}>
                          취소
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p style={{ color: "gray", fontStyle: "italic" }}>
                  아직 작성된 댓글이 없습니다...
                </p>
              )}
            </div>
          </div>

          {/* 좋아요, 작성일 */}
          <div className="detail-actions">
            <LikeButton target_id={post.post_id} target_type="post" />
            <span className="created-date">
              작성일: {new Date(post_created_at).toLocaleDateString("ko-KR")}
            </span>
          </div>

          {/* 새 댓글 입력창 */}
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
