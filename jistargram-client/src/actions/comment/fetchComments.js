import { authFetch } from "../../utils/authFetch";

export async function fetchComments(post_id) {
  try {
    const res = await authFetch("http://localhost:4000/posts/showAllComment", {
      method: "POST",
      body: JSON.stringify({ post_id }),
    });

    if (!res) return null;
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("댓글 로딩 실패:", err);
    return null;
  }
}
