import { authFetch } from "../../utils/authFetch";

export async function updatePost(formData) {
  const post_id = formData.get("post_id");
  const res = await authFetch(
    `http://localhost:4000/posts/updatePost/${post_id}`,
    { method: "PUT", body: formData }
  );
  if (!res.ok) throw new Error("수정 실패");
  return formData.get("content");
}
