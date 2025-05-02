const pool = require("../models/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//회원가입
async function register(req, res) {
  const { userid, username, email, passwd, birthdate, gender } = req.body;

  //아이디, 비밀번호 중복검사
  try {
    const idCheck = await pool.query(
      "SELECT userid FROM users WHERE userid = $1",
      [userid]
    );
    if (idCheck.rows.length > 0) {
      return res.status(400).json({ message: "이미 회원가입된 아이디입니다." });
    }

    const emailCheck = await pool.query(
      "SELECT email FROM users WHERE email = $1",
      [email]
    );
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ message: "이미 회원가입된 이메일입니다." });
    }

    //비밀번호 암호화
    const hashedPasswd = await bcrypt.hash(passwd, 10);

    //DB에 저장
    await pool.query(
      "INSERT INTO users (userid, username, email, passwd, birthdate, gender) values ($1, $2, $3, $4, $5, $6)",
      [userid, username, email, hashedPasswd, birthdate, gender]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed" });
  }
}

//로그인
async function login(req, res) {
  const { userid, passwd } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE userid = $1", [
      userid,
    ]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(passwd, user.passwd);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    //로그인 성공 -> 토큰 발급
    const token = jwt.sign({ userid: user.userid }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ message: "Login successful", token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Login failed" });
  }
}

//회원정보수정
async function updateUser(req, res) {
  const userid = req.user.userid; // 미들웨어에서 보내준 값
  const { username, email, birthdate, biography, profile_img } = req.body;

  try {
    await pool.query(
      "UPDATE users SET username = $1, email = $2, birthdate = $3, biography = $4, profile_img = $5 WHERE userid = $4",
      [username, email, birthdate, userid, biography, profile_img]
    );

    res.json({ message: "Update User Information" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "failed to update user info" });
  }
}

//회원탈퇴
async function resignUser(req, res) {
  const userid = req.user.userid;

  try {
    await pool.query("DELETE FROM users WHERE userid = $1", [userid]);

    res.json({ message: "Resign User" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "failed to resign user" });
  }
}

module.exports = { register, login, updateUser, resignUser };
