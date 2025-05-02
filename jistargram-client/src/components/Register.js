import React, { useState } from "react";

function Register({ onRegist }) {
  const [userid, setUserid] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [passwd, setPasswd] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [gender, setGender] = useState("male");

  const handleSubmit = (e) => {
    e.preventDefault();
    onRegist(userid, username, email, passwd, birthdate, gender);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="아이디"
        value={userid}
        onChange={(e) => setUserid(e.target.value)}
        required
      />
      <input
        placeholder="이름"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="이메일"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
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
      <button type="submit">회원가입</button>
    </form>
  );
}

export default Register; // ✅ 꼭 있어야 함!
