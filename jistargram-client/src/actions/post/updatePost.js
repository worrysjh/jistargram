import { authFetch } from "../../utils/authFetch";

export async function updatePost(formData, navigate) {
  try {
    const token = localStorage.getItem("token");
    const response = await authFetch(
      "http://localhost:4000/posts/updatePost",
      {
        method: "PUT",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      navigate
    );

    if (response && response.ok) {
      alert("게시물이 성공적으로 수정되었습니다.");
      return true;
    } else {
      alert("게시물 수정에 실패하였습니다.");
      return false;
    }
  } catch (err) {
    console.error("게시물 수정 중 오류 발생: ", err);
    alert("오류가 발생하였습니다.");
    return false;
  }
}
