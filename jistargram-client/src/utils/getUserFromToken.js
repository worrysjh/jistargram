import { jwtDecode } from "jwt-decode";

export function getUserFromToken() {
  const token = localStorage.getItem("access_token");
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return decoded.data; // { user_id, user_name }
  } catch (err) {
    return null;
  }
}
