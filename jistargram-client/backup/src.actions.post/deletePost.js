import { authFetch } from "../../utils/authFetch";

export async function deletePost(post_id) {
  const res = await authFetch(
    `http://localhost:4000/posts/deletePost/${post_id}`,
    {
      method: "DELETE",
    }
  );
  if (!res.ok) throw new Error("삭제 실패");
}
