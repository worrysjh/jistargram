import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "components/layout/Footer";
import { login } from "actions/auth/authActions";
import "styles/LoginPage.css";
import LoginForm from "components/auth/LoginForm";
import { Link } from "react-router-dom";
import useAuthStore from "store/useAuthStore";

function LoginPage() {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const loginSuccess = useAuthStore((state) => state.login);

  const handleLogin = async (user_name, passwd) => {
    // 정규식
    const USERNAME_REGEX = /^[a-zA-Z0-9_]{4,20}$/;
    const PASSWORD_REGEX = /^[a-zA-Z0-9!@#$%^&*]{6,30}$/;

    // 입력값 유효성 검사
    if (!USERNAME_REGEX.test(user_name)) {
      setMessage("아이디는 영문/숫자/밑줄 한정 4~20자여야 합니다.");
      return;
    }
    if (!PASSWORD_REGEX.test(passwd)) {
      setMessage(
        "비밀번호는 6~30자 영문/숫자/특수문자(!@#$%^&*)만 가능합니다."
      );
      return;
    }

    try {
      const { response, data } = await login(user_name, passwd);

      if (response.ok && data.access_token) {
        setMessage("로그인 성공");
        loginSuccess({ user_id: data.user_id });
        navigate("/home");
      } else {
        setMessage(`로그인 실패: ${data.message || "알 수 없는 오류"}`);
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
            계정이 없으신가요? <Link to="/register">가입하기</Link>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}

export default LoginPage;
