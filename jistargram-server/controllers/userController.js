const pool = require("../models/db");
const { registerUser } = require("../services/userService/registerService");
const { loginService } = require("../services/userService/loginService");
const {
  getMyProfileService,
} = require("../services/userService/getMyProfileService");
const {
  updateMyBioService,
} = require("../services/userService/updateMyBioService");
const {
  updateMyImgService,
} = require("../services/userService/updateMyImgService");
const {
  changeStateService,
} = require("../services/userService/changeStateService");

// 회원가입
async function register(req, res) {
  const { username, nickname, email, passwd, birthdate, gender } = req.body;

  try {
    const result = await registerUser({
      username,
      nickname,
      email,
      passwd,
      birthdate,
      gender,
    });

    if (!result.success) {
      return res.status(400).json({ message: result.messgae });
    }

    res.status(201).json({ message: "회원가입 성공" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "회원가입 실패" });
  }
}

// 로그인
async function login(req, res) {
  const { username, passwd } = req.body;

  try {
    const result = await loginService({ username, passwd });
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    res.json({ message: "로그인 성공", token: result.token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "로그인 실패" });
  }
}

// 내 프로필 조회
async function getMyProfile(req, res) {
  try {
    const result = await getMyProfileService(req.user.username);
    res.json(result.result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 에러" });
  }
}

// 자기소개 업데이트
async function updateProfile(req, res) {
  const { biography } = req.body;
  const username = req.user.username;
  try {
    await updateMyBioService({ biography, username });

    res.json({ message: "자기소개가 업데이트되었습니다." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "자기소개 업데이트 실패" });
  }
}

// 프로필 이미지 업데이트 (기존 이미지 삭제 포함)
async function updateProfileImg(req, res) {
  const filename = req.file.filename;
  const username = req.user.username;

  try {
    const result = await updateMyImgService({ username, filename });
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }
    res.json({ message: "프로필 업데이트 성공" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "프로필 업데이트 실패" });
  }
}

// 회원 탈퇴
async function resignUser(req, res) {
  const userid = req.user.userid;

  try {
    await changeStateService(userid);
    res.json({ message: "계정 비활성화 완료" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "계정 비활성화 실패" });
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
