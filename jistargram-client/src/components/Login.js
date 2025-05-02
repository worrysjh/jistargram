import React, { useState } from "react";

function Login({ onLogin }) {
  const [userid, setUserid] = useState("");
  const [passwd, setPasswd] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(userid, passwd);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>아이디: </label>
        <input
          type="text"
          value={userid}
          onChange={(e) => setUserid(e.target.value)}
          required
        />
      </div>
      <div>
        <label>비밀번호: </label>
        <input
          type="password"
          value={passwd}
          onChange={(e) => setPasswd(e.target.value)}
          required
        />
      </div>
      <button type="submit">로그인</button>
    </form>
  );
}

export default Login;
