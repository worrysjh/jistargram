import React, { useEffect, useState } from "react";

function IndexPage() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch("/api/posts") // 서버에서 posts 목록 가져오기
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch((err) => console.error("게시글 로딩 실패", err));
  }, []);

  return (
    <div className="post-list">
      {posts.map((post) => (
        <div key={post.postid} className="post-card">
          <div className="post-header">
            <img
              src={post.profile_img || "/default-profile.png"}
              alt="프로필"
              className="profile-pic"
            />
            <span className="username">{post.username}</span>
          </div>

          <img
            src={post.media_url || "/default-post.jpg"}
            alt="게시물"
            className="post-image"
          />

          <div className="post-caption">
            <strong>{post.username}</strong> {post.content}
          </div>
        </div>
      ))}
    </div>
  );
}

export default IndexPage;
