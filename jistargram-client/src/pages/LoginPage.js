import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/layout/Footer";
import { login } from "../actions/auth/authActions";
import "../styles/LoginPage.css";
import LoginForm from "../components/auth/LoginForm";

function LoginPage() {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (user_name, passwd) => {
    console.log("로그인 시도:", user_name);

    try {
      const { response, data } = await login(user_name, passwd);
      console.log("서버 응답:", response.status, data);

      if (response.ok && data.access_token) {
        localStorage.setItem("access_token", data.access_token);
        setMessage("로그인 성공");
        console.log("로그인 성공, 이동 중...");
        navigate("/home");
      } else {
        setMessage(`로그인 실패: ${data.message || "알 수 없는 오류"}`);
        console.log("로그인 실패:", data.message);
      }
    } catch (err) {
      console.error("서버 요청 중 오류:", err);
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
