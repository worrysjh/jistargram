import { authFetch } from "../utils/authFetch";

export async function submitPost(formData, navigate) {
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
