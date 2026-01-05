import { useState, useEffect } from "react";
import { sendVerificationCode, verifyEmailCode } from "actions/auth/authActions";

function Register({ onRegist }) {
  const [user_name, setUsername] = useState("");
  const [nick_name, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [passwd, setPasswd] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [gender, setGender] = useState("male");

  // 이메일 인증 관련 상태
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [sendCooldown, setSendCooldown] = useState(0);
  const [sendStatusMessage, setSendStatusMessage] = useState("");
  const [verifyStatusMessage, setVerifyStatusMessage] = useState("");
  const [emailError, setEmailError] = useState("");

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

  useEffect(() => {
    let timer;
    if (sendCooldown > 0) {
      timer = setInterval(() => {
        setSendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [sendCooldown]);

  const handleSendVerification = async () => {
    if (!email) {
      setSendStatusMessage("이메일을 입력해주세요.");
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
      } else {
        setVerifyStatusMessage("* 인증에 실패하였습니다.");
      }
    } catch (err) {
      setVerifyStatusMessage("* 서버 연결 실패");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isEmailVerified) {
      alert("* 이메일 인증을 완료해주세요.");
      return;
    }
    onRegist(user_name, nick_name, email, passwd, birthdate, gender);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="아이디"
        value={user_name}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        placeholder="닉네임"
        value={nick_name}
        onChange={(e) => setNickname(e.target.value)}
        required
      />
      <div className="input-with-button">
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={handleEmailChange}
          className={emailError ? "error-input" : ""}
          disabled={isEmailVerified}
          required
        />
        <button
          type="button"
          onClick={handleSendVerification}
          disabled={sendCooldown > 0 || isEmailVerified || (email && emailError)}
        >
          {sendCooldown > 0 ? `${sendCooldown}s` : "인증하기"}
        </button>
      </div>
      {emailError && (
        <p className="status-message verify-status error">{emailError}</p>
      )}
      {sendStatusMessage && (
        <p className="status-message send-status">{sendStatusMessage}</p>
      )}

      {isCodeSent && (
        <>
          <div className="input-with-button">
            <input
              placeholder="인증번호"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              disabled={isEmailVerified}
              required
            />
            <button
              type="button"
              onClick={handleVerifyCode}
              disabled={isEmailVerified}
            >
              확인
            </button>
          </div>
          {verifyStatusMessage && (
            <p className={`status-message verify-status ${isEmailVerified ? 'success' : 'error'}`}>
              {verifyStatusMessage}
            </p>
          )}
        </>
      )}

      <input
        type="password"
        placeholder="비밀번호"
        value={passwd}
        onChange={(e) => setPasswd(e.target.value)}
        required
      />
      <label>생년월일</label>
      <input
        type="date"
        value={birthdate}
        onChange={(e) => setBirthdate(e.target.value)}
        required
      />
      <div className="gender-selection">
        <label>
          <input
            type="radio"
            name="gender"
            value="male"
            checked={gender === "male"}
            onChange={(e) => setGender(e.target.value)}
          />
          남
        </label>
        <label>
          <input
            type="radio"
            name="gender"
            value="female"
            checked={gender === "female"}
            onChange={(e) => setGender(e.target.value)}
          />
          여
        </label>
      </div>
      <button type="submit" disabled={!isEmailVerified}>
        회원가입
      </button>
    </form>
  );
}

export default Register;
