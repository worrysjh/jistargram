import { authFetch } from "../../utils/authFetch";

// 특정 사용자 게시물 조회
export async function fetchMyPosts(user_id) {
  const endpoint = user_id
    ? `${process.env.REACT_APP_API_URL}/posts/user/${user_id}`
    : `${process.env.REACT_APP_API_URL}/posts/getMyPost`;

  const response = await authFetch(endpoint);
  if (!response.ok) throw new Error("게시물 로딩 실패");
  return await response.json();
}

// 특정 사용자 프로필 조회
export async function fetchProfile(user_id, navigate) {
  const endpoint = user_id
    ? `${process.env.REACT_APP_API_URL}/users/${user_id}`
    : `${process.env.REACT_APP_API_URL}/users/getMyProfile`;

  const response = await authFetch(endpoint, {}, navigate);
  if (!response) throw new Error("프로필 로딩 실패");
  return await response.json();
}

// 자기소개 업데이트 (로그인 사용자만 가능)
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

// 프로필 이미지 업데이트 (로그인 사용자만 가능)
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
