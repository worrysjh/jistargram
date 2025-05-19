import { authFetch } from "../../utils/authFetch";

export async function fetchPosts() {
  const res = await authFetch("http://localhost:4000/posts/showPost");
  if (!res.ok) throw new Error("네트워크 응답 실패");
  return res.json();
}
