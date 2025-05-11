import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/layout/Footer";

import "../styles/LoginPage.css";
import { authFetch } from "../utils/authFetch";
import LoginForm from "../components/LoginForm";

function LoginPage() {
  const [message, setMessage] = useState("");
  const navigator = useNavigate();

  const handleLogin = async (userid, passwd) => {
    try {
      const response = await authFetch("http://localhost:4000/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userid, passwd }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        setMessage("로그인 성공");
        navigator("/");
      } else {
        setMessage(`로그인 실패: ${data.message}`);
      }
    } catch (err) {
      console.log("서버 오류: ", err);
      setMessage("서버 연결 실패");
    }
  };

  return (
    <>
      <div className="login-container">
        <div className="form-wrapper">
          <div className="login-box">
            <h2>Jistargram</h2>
            <LoginForm onLogin={handleLogin} />
            <div className="divider">또는</div>
            <a href="forgot" className="forgot-link">
              비밀번호를 잊으셨나요?
            </a>
            <p className="login-message">{message}</p>
          </div>

          <div className="signup-box">
            계정이 없으신가요? <a href="/register">가입하기</a>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}

export default LoginPage;
