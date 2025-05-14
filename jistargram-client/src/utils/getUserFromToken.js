import { jwtDecode } from "jwt-decode";

export function getUserFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    return jwtDecode(token);
  } catch (err) {
    console.error("토큰 디코딩 실패", err);
    return null;
  }
}
