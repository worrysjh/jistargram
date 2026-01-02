import { authFetch } from "utils/authFetch";

// 댓글 등록
export async function addComment({
  post_id,
  comment_content,
  parent_comment_id = null,
}) {
  const res = await authFetch(
    `${process.env.REACT_APP_API_URL}/posts/newComment`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id, comment_content, parent_comment_id }),
    }
  );
  if (!res.ok) throw new Error("댓글 등록 실패");
}

// 댓글 삭제
export async function deleteComment(comment_id) {
  const res = await authFetch(
    `${process.env.REACT_APP_API_URL}/posts/deleteComment/${comment_id}`,
    { method: "DELETE" }
  );
  if (!res.ok) throw new Error("댓글 삭제 실패");
}

// 댓글 조회
export async function fetchComments(post_id) {
  try {
    const res = await authFetch(
      `${process.env.REACT_APP_API_URL}/posts/showAllComment`,
      {
        method: "POST",
        body: JSON.stringify({ post_id }),
      }
    );

    if (!res) return null;
    const data = await res.json();
    return data;
  } catch (err) {
    return null;
  }
}
