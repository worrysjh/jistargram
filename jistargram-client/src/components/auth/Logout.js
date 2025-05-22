import React from "react";
import { useNavigate } from "react-router-dom";

function Logout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // 서버에 로그아웃 요청 (refresh_token 쿠키 삭제)
      await fetch("http://localhost:4000/auth/logout", {
        method: "POST",
        credentials: "include", // 쿠키 포함 필수
      });
    } catch (err) {
      console.error("서버 로그아웃 실패", err);
    }

    // 클라이언트 access_token 제거
    localStorage.removeItem("access_token");
    alert("로그아웃 하였습니다.");
    navigate("/login");
  };

  return (
    <li onClick={handleLogout} style={{ cursor: "pointer" }} role="button">
      로그아웃
    </li>
  );
}

export default Logout;
