import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "../../styles/PostDetailModal.css";
import {
  addComment,
  deleteComment,
} from "../../actions/comment/commentActions";
import { fetchAndFlattenComments } from "../../utils/commentUtils";
import { fetchFollowStatus, addFollowUser } from "actions/user/userActions";
import PostOwnerMenu from "./PostOwnerMenu";
import LikeButton from "../common/LikeButton";
import { Link } from "react-router-dom";
import { calculateDateDifference } from "utils/dateCalculate";

function PostDetailModal({ post, onClose }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const post_id = post.post_id;
  const post_created_at = post.created_at;
  const [currentUser, setCurrentUser] = useState(null);
  const [menuOpenFor, setMenuOpenFor] = useState(null);
  const [followStatus, setFollowStatus] = useState(null);

  const toggleMenu = (post_id) =>
    setMenuOpenFor((prev) => (prev === post_id ? null : post_id));

  const openUpdate = (post) => {
    alert("수정 기능은 아직 구현되지 않았습니다.");
  };

  const onDelete = async (post_id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      alert("삭제 기능은 아직 구현되지 않았습니다.");
      onClose(); // 모달 닫기
    } catch {
      alert("삭제 실패");
    }
  };

  const isOwner = currentUser?.user_id === post.user_id;

  useEffect(() => {
    (async () => {
      try {
        const followRes = await fetchFollowStatus(post.user_id);
        setFollowStatus(followRes.isFollowing ? 1 : 0);
      } catch (err) {
        console.error("팔로우 상태 조회 실패:", err);
        setFollowStatus(0);
      }
    })();
  }, [post.user_id]);

  // 댓글 조회
  useEffect(() => {
    (async () => {
      try {
        const { comments, user } = await fetchAndFlattenComments(post_id);
        setCurrentUser(user);
        setComments(comments);
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

      const { comments } = await fetchAndFlattenComments(post_id);
      setComments(comments);
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

      const { comments } = await fetchAndFlattenComments(post_id);
      setComments(comments);
    } catch (err) {
      console.error("답글 등록 에러:", err);
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (comment_id) => {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;
    try {
      await deleteComment(comment_id);

      const { comments } = await fetchAndFlattenComments(post_id);
      setComments(comments);
    } catch (err) {
      console.error("댓글 삭제 에러:", err);
    }
  };

  const handleFollow = async (user_id) => {
    try {
      await addFollowUser(user_id);
      setFollowStatus(1);
    } catch (err) {
      console.error(err);
      alert("팔로우 처리 중 오류가 발생했습니다.");
    }
  };

  if (!post) return null;

  return ReactDOM.createPortal(
    <div className="detail-modal-overlay" onClick={onClose}>
      <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* 좌측 이미지 */}
        <div className="detail-left">
          <img
            src={`${process.env.REACT_APP_API_URL}${post.media_url}`}
            alt="게시물"
          />
        </div>
        {/* 우측 콘텐츠 */}
        <div className="detail-right">
          {/* 헤더 */}
          <div className="detail-header">
            <img
              src={
                post.profile_img
                  ? `${process.env.REACT_APP_API_URL}${post.profile_img}`
                  : "/common/img/사용자이미지.jpeg"
              }
              alt="프로필"
              className="detail-profile-img"
            />
            <span className="detail-username">{post.user_name}</span>
            {/* 팔로우 기능 구현 */}
            {followStatus === 0 && !isOwner ? (
              <button
                className="follow-btn"
                onClick={() => handleFollow(post.user_id)}
              >
                팔로우
              </button>
            ) : null}
            <PostOwnerMenu
              post={post}
              isOwner={isOwner}
              menuOpenFor={menuOpenFor}
              toggleMenu={toggleMenu}
              onUpdate={openUpdate}
              onDelete={onDelete}
            />

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
                      <Link
                        to={
                          isOwner ? "/profile" : `/profile?user_id=${c.user_id}`
                        }
                        className="username"
                      >
                        <b>{c.user_name}</b>
                      </Link>{" "}
                      {c.comment_state === "삭제" ? (
                        <span style={{ color: "gray", fontStyle: "italic" }}>
                          삭제된 댓글입니다.
                        </span>
                      ) : (
                        <>
                          {c.comment_content}
                          <br />

                          <LikeButton
                            target_id={c.comment_id}
                            target_type="comment"
                          />

                          <small className="comment-date">
                            {calculateDateDifference(c.created_at, new Date())}
                          </small>

                          <span
                            className="comment-action reply-text"
                            onClick={() =>
                              setReplyTarget((prev) =>
                                prev === c.comment_id ? null : c.comment_id
                              )
                            }
                          >
                            답글 달기
                          </span>
                          {currentUser.user_id === c.user_id && (
                            <>
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
