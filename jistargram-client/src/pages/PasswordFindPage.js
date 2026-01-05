import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { sendVerificationCode, verifyEmailCode } from "actions/auth/authActions";
import Footer from "components/layout/Footer";
import "styles/PasswordFindPage.css";

function PasswordFindPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [sendCooldown, setSendCooldown] = useState(0);
  const [sendStatusMessage, setSendStatusMessage] = useState("");
  const [verifyStatusMessage, setVerifyStatusMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (sendCooldown > 0) {
      timer = setInterval(() => {
        setSendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [sendCooldown]);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (value && !validateEmail(value)) {
      setEmailError("이메일 형식이 잘못되었습니다.");
    } else {
      setEmailError("");
    }
  };

  const handleSendVerification = async () => {
    if (!email) {
      setSendStatusMessage("* 이메일을 입력해주세요.");
      return;
    }
    if (!validateEmail(email)) {
      setEmailError("이메일 형식이 잘못되었습니다.");
      return;
    }

    try {
      const { response, data } = await sendVerificationCode(email);
      if (response.ok) {
        setIsCodeSent(true);
        setSendStatusMessage("* 인증번호가 발송되었습니다.");
        setSendCooldown(10);
      } else {
        setSendStatusMessage(data.message || "* 발송 실패");
      }
    } catch (err) {
      setSendStatusMessage("* 서버 연결 실패");
    }
  };

  const handleVerifyCode = async () => {
    try {
      const { response, data } = await verifyEmailCode(email, verificationCode);
      if (response.ok) {
        setIsEmailVerified(true);
        setVerifyStatusMessage("* 인증에 성공하였습니다.");
        setTimeout(() => {
          navigate("/password-reset", { state: { email } });
        }, 1200);
      } else {
        setVerifyStatusMessage("* 인증에 실패하였습니다.");
      }
    } catch (err) {
      setVerifyStatusMessage("* 서버 연결 실패");
    }
  };

  return (
    <div className="password-find-container">
      <div className="password-find-wrapper">
        <div className="password-find-box">
          <div className="lock-icon-container">
            <svg
              aria-label="잠금장치"
              color="rgb(0, 0, 0)"
              fill="rgb(0, 0, 0)"
              height="62"
              role="img"
              viewBox="0 0 96 96"
              width="62"
            >
              <path d="M48 0C21.5 0 0 21.5 0 48s21.5 48 48 48 48-21.5 48-48S74.5 0 48 0zm0 93C23.2 93 3 72.8 3 48S23.2 3 48 3s45 20.2 45 45-20.2 45-45 45z"></path>
              <path d="M64 42H32c-2.2 0-4 1.8-4 4v24c0 2.2 1.8 4 4 4h32c2.2 0 4-1.8 4-4V46c0-2.2-1.8-4-4-4zm1 28c0 .6-.4 1-1 1H32c-.6 0-1-.4-1-1V46c0-.6.4-1 1-1h32c.6 0 1 .4 1 1v24zM48 20c-7.2 0-13 5.8-13 13v7h3v-7c0-5.5 4.5-10 10-10s10 4.5 10 10v7h3v-7c0-7.2-5.8-13-13-13z"></path>
            </svg>
          </div>
          <h4 className="title">로그인에 문제가 있나요?</h4>
          <p className="description">
            이메일 주소를 입력하시면 계정에 다시 액세스할 수 있는 인증 코드를 보내드립니다.
          </p>

          <div className="input-container">
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={handleEmailChange}
              className={emailError ? "error-input" : ""}
              disabled={isEmailVerified}
            />
            {emailError && <p className="error-text">{emailError}</p>}
          </div>

          {!isCodeSent ? (
            <button
              className="send-link-btn"
              onClick={handleSendVerification}
              disabled={!email || emailError || sendCooldown > 0}
            >
              {sendCooldown > 0 ? `${sendCooldown}초 후 재전송` : "인증 코드 보내기"}
            </button>
          ) : (
            <>
              <div className="input-container mt-10">
                <input
                  type="text"
                  placeholder="인증번호"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  disabled={isEmailVerified}
                />
              </div>
              <button
                className="verify-btn"
                onClick={handleVerifyCode}
                disabled={isEmailVerified || !verificationCode}
              >
                확인
              </button>
              <button
                className="resend-btn"
                onClick={handleSendVerification}
                disabled={sendCooldown > 0 || isEmailVerified}
              >
                {sendCooldown > 0 ? `재전송 (${sendCooldown}s)` : "인증 코드 재전송"}
              </button>
            </>
          )}

          {sendStatusMessage && <p className="status-message">{sendStatusMessage}</p>}
          {verifyStatusMessage && (
            <p className={`status-message ${isEmailVerified ? "success" : "error"}`}>
              {verifyStatusMessage}
            </p>
          )}

          <div className="divider">또는</div>

          <a href="/register" className="new-account-link">
            새 계정 만들기
          </a>
        </div>

        <div className="back-to-login-box">
          <a href="/login" className="back-to-login-link">
            로그인으로 돌아가기
          </a>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default PasswordFindPage;
