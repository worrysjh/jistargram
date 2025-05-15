import { authFetch } from "../../utils/authFetch";

export async function fetchProfile(navigate) {
  const token = localStorage.getItem("token");
  const response = await authFetch(
    "http://localhost:4000/users/getMyProfile",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    navigate
  );
  if (!response) throw new Error("인증 실패 또는 서버 응답 없음");
  return response.json();
}
