import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { resetPassword } from "actions/auth/authActions";
import Footer from "components/layout/Footer";
import "styles/PasswordResetPage.css";

function PasswordResetPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  useEffect(() => {
    console.log("PasswordResetPage - Received email:", email);
    if (!email) {
      alert("잘못된 접근입니다. 다시 시도해주세요.");
      navigate("/password-find");
    }
  }, [email, navigate]);

  if (!email) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 유효성 검사
    if (newPassword.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const { response, data } = await resetPassword(email, newPassword);
      if (response.ok) {
        alert("비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.");
        navigate("/login");
      } else {
        // 서버에서 온 에러 메시지를 직접 출력 (예: "사용자를 찾을 수 없습니다.")
        setError(data.message || "비밀번호 변경 실패");
      }
    } catch (err) {
      console.error("비밀번호 변경 중 오류:", err);
      setError("서버 연결 실패");
    }
  };

  return (
    <div className="reset-container">
      <div className="form-wrapper">
        <div className="reset-box">
          <h2>Jistargram</h2>
          <p className="description">새 비밀번호를 설정해주세요.</p>
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              placeholder="새 비밀번호"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setError("");
              }}
              required
            />
            <input
              type="password"
              placeholder="새 비밀번호 확인"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError("");
              }}
              required
            />
            <button type="submit">비밀번호 변경</button>
          </form>
          {error && <p className="error-message">{error}</p>}
          {message && <p className="success-message">{message}</p>}
        </div>

        <div className="back-login-box">
          <a href="/login">로그인으로 돌아가기</a>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default PasswordResetPage;
