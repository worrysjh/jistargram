import React, { useEffect, useState } from "react";
import { authFetch } from "../utils/authFetch";
import "../styles/PostPage.css";

function PostPage() {
  const [posts, setPosts] = useState([]);
  console.log(posts);

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

  return (
    <div className="post-list">
      {posts.map((post) => (
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
          </div>

          <img
            src={
              `http://localhost:4000${post.media_url}` || "/default-post.jpg"
            }
            alt="게시물"
            className="post-image"
          />

          <div className="post-caption">
            <strong>{post.user_name}</strong> {post.content}
          </div>
        </div>
      ))}
    </div>
  );
}

export default PostPage;
