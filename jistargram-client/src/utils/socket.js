import { io } from "socket.io-client";

// 쿠키에서 access_token 추출
function getAccessToken() {
  const cookies = document.cookie.split("; ");
  const tokenCookie = cookies.find((c) => c.startsWith("access_token="));
  return tokenCookie ? tokenCookie.split("=")[1] : null;
}

export const socket = io(process.env.REACT_APP_API_URL, {
  withCredentials: true,
  autoConnect: true,
  auth: {
    token: getAccessToken(),
  },
});
