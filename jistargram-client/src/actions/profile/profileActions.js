import { authFetch } from "../../utils/authFetch";

export async function fetchMyPosts() {
  const access_token = localStorage.getItem("access_token");
  const response = await authFetch(
    `${process.env.REACT_APP_API_URL}/posts/getMyPost`,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );
  if (!response.ok) throw new Error("내 게시물 로딩 실패");
  return response.json();
}

export async function fetchProfile(navigate) {
  const access_token = localStorage.getItem("access_token");
  const response = await authFetch(
    `${process.env.REACT_APP_API_URL}/users/getMyProfile`,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    },
    navigate
  );
  if (!response) throw new Error("인증 실패 또는 서버 응답 없음");
  return response.json();
}

export async function updateProfileBio(biography, navigate) {
  const response = await authFetch(
    `${process.env.REACT_APP_API_URL}/users/updateProfile`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ biography }),
    },
    navigate
  );
  if (!response) throw new Error("소개 수정 실패");
}

export async function updateProfileImage(file, navigate) {
  const formData = new FormData();
  formData.append("profile_img", file);

  const response = await authFetch(
    `${process.env.REACT_APP_API_URL}/users/updateProfileImg`,
    {
      method: "POST",
      body: formData,
    },
    navigate
  );
  if (!response) throw new Error("이미지 업로드 실패");
}
