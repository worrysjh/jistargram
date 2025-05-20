import { authFetch } from "../../utils/authFetch";

export async function fetchProfile(navigate) {
  const access_token = localStorage.getItem("access_token");
  const response = await authFetch(
    "http://localhost:4000/users/getMyProfile",
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
