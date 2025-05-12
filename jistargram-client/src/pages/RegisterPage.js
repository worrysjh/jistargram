import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Register from "../components/Register";
import Footer from "../components/layout/Footer";

import "../styles/RegisterPage.css";
import { authFetch } from "../utils/authFetch";

function RegisterPage() {
  const [message, setMessage] = useState("");
  const navigator = useNavigate();

  const handleRegist = async (
    username,
    nickname,
    email,
    passwd,
    birthdate,
    gender
  ) => {
    try {
      const response = await authFetch("http://localhost:4000/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          nickname,
          email,
          passwd,
          birthdate,
          gender,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("회원가입 성공");
        alert("회원가입에 성공하였습니다.");
        navigator("/login");
      } else {
        setMessage(`회원가입 실패: ${data.message}`);
      }
    } catch (err) {
      console.log("서버 오류:", err);
      setMessage("서버 연결 실패");
    }
  };

  return (
    <>
      <div className="register-container">
        <div className="form-wrapper">
          <div className="register-box">
            <h2>Jistargram</h2>
            <Register onRegist={handleRegist} />
            <p className="register-message">{message}</p>
          </div>

          <div className="login-box">
            계정이 있으신가요? <p />
            <a href="/login">로그인하기</a>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}

export default RegisterPage;
