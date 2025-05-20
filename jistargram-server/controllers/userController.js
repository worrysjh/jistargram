const {
  registerUser,
  loginService,
  getMyProfileService,
  updateMyBioService,
  updateMyImgService,
  changeStateService,
} = require("../services/user.service");

// 회원가입
async function register(req, res) {
  const { user_name, nick_name, email, passwd, birthdate, gender } = req.body;

  try {
    const result = await registerUser({
      user_name,
      nick_name,
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
  const { user_name, passwd } = req.body;

  try {
    const result = await loginService({ user_name, passwd });
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }
    res.cookie("refresh_token", result.refresh_token, {
      httpOnly: true,
      secure: false, //process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 60 * 60 * 24 * 7 * 1000,
    });
    res.json({ message: "로그인 성공", access_token: result.access_token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "로그인 실패" });
  }
}

// 내 프로필 조회
async function getMyProfile(req, res) {
  const user_name = req.user.user_name;

  try {
    const result = await getMyProfileService(user_name);
    res.json(result.result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 에러" });
  }
}

// 자기소개 업데이트
async function updateProfile(req, res) {
  const { biography } = req.body;
  const user_name = req.user.user_name;

  try {
    await updateMyBioService({ biography, user_name });
    res.json({ message: "자기소개가 업데이트되었습니다." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "자기소개 업데이트 실패" });
  }
}

// 프로필 이미지 업데이트 (기존 이미지 삭제 포함)
async function updateProfileImg(req, res) {
  const filename = req.file.filename;
  const user_name = req.user.user_name;

  try {
    const result = await updateMyImgService({ user_name, filename });
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
  const user_id = req.user.user_id;

  try {
    await changeStateService(user_id);
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
