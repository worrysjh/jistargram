import React, { useState } from "react";

function LoginForm({ onLogin }) {
  const [user_name, setUsername] = useState("");
  const [passwd, setPasswd] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(user_name, passwd);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="text"
          placeholder="아이디"
          value={user_name}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="login-input"
        />
      </div>
      <div>
        <input
          type="password"
          placeholder="비밀번호"
          value={passwd}
          onChange={(e) => setPasswd(e.target.value)}
          required
          className="login-input"
        />
      </div>
      <button type="submit" className="login-button">
        로그인
      </button>
    </form>
  );
}

export default LoginForm;
