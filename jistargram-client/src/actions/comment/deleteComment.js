import { authFetch } from "../../utils/authFetch";

export async function deleteComment(comment_id) {
  const res = await authFetch(
    `http://localhost:4000/posts/deleteComment/${comment_id}`,
    { method: "DELETE" }
  );
  if (!res.ok) throw new Error("댓글 삭제 실패");
}
