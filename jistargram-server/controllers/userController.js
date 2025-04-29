const pool = require("../models/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//회원가입
async function register(req, res) {
  const { userid, username, email, passwd, birthdate, gender } = req.body;

  try {
    //비밀번호 암호화
    const hashedPasswd = await bcrypt.hash(passwd, 10);

    //DB에 저장
    await pool.query(
      "INSERT INTO users (userid, username, email, passwd, birthdate, gender) values ($1, $2, $3, $4, $5, $6)",
      [userid, username, email, hashedPasswd, birthdate, gender]
    );

    res.status(201).json({ message: "✅ User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "❌ Registration failed" });
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
      return res.status(400).json({ message: "❌ Invalid credentials" });
    }

    const match = await bcrypt.compare(passwd, user.passwd);
    if (!match) {
      return res.status(400).json({ message: "❌ Invalid credentials" });
    }

    //로그인 성공 -> 토큰 발급
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ message: "✅ Login successful", token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "❌ Login failed" });
  }
}

module.exports = { register, login };
