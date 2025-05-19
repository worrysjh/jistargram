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

export async function fetchPosts() {
  const res = await authFetch("http://localhost:4000/posts/showPost");
  if (!res.ok) throw new Error("네트워크 응답 실패");
  return res.json();
}

export async function updatePost(formData) {
  const post_id = formData.get("post_id");
  const res = await authFetch(
    `http://localhost:4000/posts/updatePost/${post_id}`,
    { method: "PUT", body: formData }
  );
  if (!res.ok) throw new Error("수정 실패");
  return formData.get("content");
}

export async function uploadPost(formData, navigate) {
  try {
    const token = localStorage.getItem("token");
    const response = await authFetch(
      "http://localhost:4000/posts/uploadPost",
      {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      navigate
    );

    if (response && response.ok) {
      alert("게시물이 성공적으로 등록되었습니다.");
      return true;
    } else {
      alert("게시물 업로드에 실패하였습니다.");
      return false;
    }
  } catch (err) {
    console.error("업로드 중 오류 발생: ", err);
    alert("오류가 발생하였습니다.");
    return false;
  }
}
