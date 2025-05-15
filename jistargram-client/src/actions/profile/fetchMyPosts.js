import { authFetch } from "../../utils/authFetch";

export async function fetchMyPosts() {
  const token = localStorage.getItem("token");
  const response = await authFetch("http://localhost:4000/posts/getMyPost", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("내 게시물 로딩 실패");
  return response.json();
}
