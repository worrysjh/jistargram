import { jwtDecode } from "jwt-decode";

export function getUserFromToken() {
  const access_token = localStorage.getItem("access_token");
  if (!access_token) return null;

  try {
    return jwtDecode(access_token);
  } catch (err) {
    console.error("토큰 디코딩 실패", err);
    return null;
  }
}
