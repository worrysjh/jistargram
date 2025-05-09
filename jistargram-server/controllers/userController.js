const pool = require("../models/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

// 회원가입
async function register(req, res) {
  const { userid, username, email, passwd, birthdate, gender } = req.body;

  try {
    const idCheck = await pool.query(
      "SELECT userid FROM users WHERE userid = $1",
      [userid]
    );
    if (idCheck.rows.length > 0) {
      return res.status(400).json({ message: "이미 사용 중인 아이디입니다." });
    }

    const emailCheck = await pool.query(
      "SELECT email FROM users WHERE email = $1",
      [email]
    );
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ message: "이미 사용 중인 이메일입니다." });
    }

    const hashedPasswd = await bcrypt.hash(passwd, 10);

    await pool.query(
      "INSERT INTO users (userid, username, email, passwd, birthdate, gender) values ($1, $2, $3, $4, $5, $6)",
      [userid, username, email, hashedPasswd, birthdate, gender]
    );

    res.status(201).json({ message: "회원가입 성공" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "회원가입 실패" });
  }
}

// 로그인
async function login(req, res) {
  const { userid, passwd } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE userid = $1", [
      userid,
    ]);
    const user = result.rows[0];

    if (!user) {
      return res
        .status(400)
        .json({ message: "잘못된 아이디 또는 비밀번호입니다." });
    }

    const match = await bcrypt.compare(passwd, user.passwd);
    if (!match) {
      return res
        .status(400)
        .json({ message: "잘못된 아이디 또는 비밀번호입니다." });
    }

    const token = jwt.sign({ userid: user.userid }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ message: "로그인 성공", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "로그인 실패" });
  }
}

// 내 프로필 조회
async function getMyProfile(req, res) {
  try {
    const result = await pool.query(
      "SELECT userid, username, email, birthdate, biography, profile_img, created_at FROM users WHERE userid = $1",
      [req.user.userid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "유저를 찾을 수 없음" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 에러" });
  }
}

// 자기소개 업데이트
async function updateProfile(req, res) {
  const { biography } = req.body;
  const userid = req.user.userid;

  try {
    await pool.query("UPDATE users SET biography=$1 WHERE userid=$2", [
      biography,
      userid,
    ]);

    res.json({ message: "자기소개가 업데이트되었습니다." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "자기소개 업데이트 실패" });
  }
}

// 프로필 이미지 업데이트 (기존 이미지 삭제 포함)
async function updateProfileImg(req, res) {
  const filename = req.file.filename;
  const userid = req.user.userid;

  const imagePath = `/uploads/profile_imgs/${filename}`;

  // 기존 이미지 삭제
  const result = await pool.query(
    "SELECT profile_img FROM users WHERE userid = $1",
    [userid]
  );
  const oldImage = result.rows[0]?.profile_img;

  if (oldImage && oldImage !== "/common/img/사용자이미지.jpeg") {
    const oldImagePath = path.join(__dirname, "..", "public", oldImage);
    fs.unlink(oldImagePath, (err) => {
      if (err) {
        console.log("기존 이미지 삭제 실패 또는 존재하지 않음:", err.message);
      } else {
        console.log("기존 이미지 삭제 성공:", oldImagePath);
      }
    });
  }

  // DB 업데이트
  await pool.query("UPDATE users SET profile_img = $1 WHERE userid = $2", [
    imagePath,
    userid,
  ]);

  res.json({ message: "프로필 이미지 업데이트 완료", path: imagePath });
}

// 회원 탈퇴
async function resignUser(req, res) {
  const userid = req.user.userid;

  try {
    await pool.query("DELETE FROM users WHERE userid = $1", [userid]);
    res.json({ message: "회원 탈퇴 완료" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "회원 탈퇴 실패" });
  }
}

module.exports = {
  register,
  login,
  updateProfile,
  resignUser,
  getMyProfile,
  updateProfileImg,
};
