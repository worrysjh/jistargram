import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Register from "components/auth/Register";
import Footer from "components/layout/Footer";
import "styles/RegisterPage.css";
import { register } from "actions/auth/authActions";

function RegisterPage() {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleRegist = async (
    user_name,
    nick_name,
    email,
    passwd,
    birthdate,
    gender
  ) => {
    try {
      const { response, data } = await register({
        user_name,
        nick_name,
        email,
        passwd,
        birthdate,
        gender,
      });

      if (response.ok) {
        setMessage("회원가입 성공");
        alert("회원가입에 성공하였습니다.");
        navigate("/login");
      } else {
        setMessage(`회원가입 실패: ${data.message}`);
      }
    } catch (err) {
      console.error("서버 오류:", err);
      setMessage("서버 연결 실패");
    }
  };

  return (
    <div className="register-container">
      <div className="form-wrapper">
        <div className="register-box">
          <h2>Jistargram</h2>
          <Register onRegist={handleRegist} />
          <p className="register-message">{message}</p>
        </div>

        <div className="login-box">
          계정이 있으신가요? <br />
          <a href="/login">로그인하기</a>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default RegisterPage;
