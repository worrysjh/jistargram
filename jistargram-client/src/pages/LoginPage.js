import React, { useState } from "react";
import Login from "../components/Login";

function LoginPage() {
  const [message, setMessage] = useState("");

  const handleLogin = async (userid, passwd) => {
    try {
      const response = await fetch("http://localhost:4000/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userid, passwd }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        setMessage("로그인 성공");
      } else {
        setMessage(`로그인 실패: ${data.message}`);
      }
    } catch (err) {
      console.log("서버 오류: ", err);
      setMessage("서버 연결 실패");
    }
  };

  return (
    <dev>
      <h2>로그인 페이지</h2>
      <Login onLogin={handleLogin} />
      <p>{message}</p>
    </dev>
  );
}

export default LoginPage;
