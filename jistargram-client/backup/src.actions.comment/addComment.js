import { authFetch } from "../../utils/authFetch";

export async function addComment({
  post_id,
  comment_content,
  parent_id = null,
}) {
  const res = await authFetch("http://localhost:4000/posts/newComment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ post_id, comment_content, parent_id }),
  });
  if (!res.ok) throw new Error("댓글 등록 실패");
}
