import React, { useEffect, useState, useRef, useCallback } from "react";
import PostDetailModal from "components/posts/PostDetailModal";
import PostUpdateModal from "components/posts/PostUpdateModal";
import LikeButton from "components/common/LikeButton";
import "styles/PostPage.css";
import { Link } from "react-router-dom";
import { fetchPosts, updatePost, deletePost } from "actions/post/postActions";
import { fetchFollowStatus, addFollowUser } from "actions/user/userActions";
import PostOwnerMenu from "components/posts/PostOwnerMenu";
import { calculateDateDifference } from "utils/dateCalculate";

function PostPage() {
  const [posts, setPosts] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [detailModal, setDetailModal] = useState({ open: false, post: null });
  const [updateModal, setUpdateModal] = useState({ open: false, post: null });
  const [menuOpenFor, setMenuOpenFor] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [followStatuses, setFollowStatuses] = useState({});
  const [limit, setLimit] = useState(3);
  const [isLast, setIsLast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const observer = useRef();

  const lastPostRef = useCallback(
    (node) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !isLast) {
          setLimit((prev) => prev + 3);
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, isLast]
  );

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const data = await fetchPosts(limit);

        setCurrentUser(data.user);
        setPosts(data.result);

        // 게시물 작성자들의 팔로우 상태를 병렬로 조회
        const userIds = Array.from(
          new Set(data.result.map((p) => p.user_id))
        ).filter((id) => id !== data.user.user_id);
        const statuses = {};
        await Promise.all(
          userIds.map(async (uid) => {
            try {
              const res = await fetchFollowStatus(uid);
              statuses[uid] = res.isFollowing ? 1 : 0;
            } catch (e) {
              statuses[uid] = 0;
            }
          })
        );
        setFollowStatuses(statuses);
        setIsLast(data.result.length < limit);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [limit]);

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

  const handleLoadMore = () => {
    setLimit((prev) => prev + 3);
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

  const handleFollow = async (user_id) => {
    try {
      await addFollowUser(user_id);
      setFollowStatuses((prev) => ({ ...prev, [user_id]: 1 }));
    } catch (err) {
      console.error(err);
      alert("팔로우 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <>
      <div className="post-list">
        {posts.length > 0 ? (
          posts.map((post, index) => {
            const lines = post.content.split("\n");
            const long = lines.length > 1;
            const expandedHere = expanded[post.post_id];
            if (!currentUser) return <div>로딩 중...</div>;
            const isOwner = currentUser.user_id === post.user_id;
            const isLastPost = index === posts.length - 1;

            return (
              <div
                key={post.post_id}
                className="post-card"
                ref={isLastPost ? lastPostRef : null}
              >
                {/* header */}
                <div className="post-header">
                  <img
                    className="profile-pic"
                    src={
                      post.profile_img
                        ? `${process.env.REACT_APP_API_URL}${post.profile_img}`
                        : "/common/img/사용자이미지.jpeg"
                    }
                    alt="프로필"
                  />
                  <Link
                    to={
                      isOwner ? "/profile" : `/profile?user_id=${post.user_id}`
                    }
                    className="username"
                  >
                    {post.user_name}
                  </Link>
                  <span>
                    • {calculateDateDifference(post.created_at, new Date())}
                  </span>
                  {/* 팔로우 기능 구현 */}
                  {followStatuses[post.user_id] === 0 && !isOwner ? (
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
                </div>

                {/* image */}
                <img
                  className="post-image"
                  src={`${process.env.REACT_APP_API_URL}${post.media_url}`}
                  alt="게시물"
                />

                {/* likes button */}
                <div className="post-actions">
                  <LikeButton target_id={post.post_id} target_type="post" />
                </div>

                {/* likes */}
                <div className="post-likes">
                  좋아요 {post.like_count || 0}개
                </div>

                {/* caption */}
                <div className="post-caption">
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
                          {" "}
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
                          {" "}
                          ...더 보기
                        </span>
                      )}
                    </>
                  )}
                </div>

                {/* comments */}
                <div className="comment-area">
                  <span onClick={() => openDetail(post)}>
                    댓글 {post.comment_count}개 모두 보기
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-posts">작성된 피드가 없습니다...</div>
        )}
        {isLoading && <div className="loading">피드 로딩 중...</div>}
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
