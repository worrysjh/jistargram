const services = require("../services");

// 회원가입
async function register(req, res) {
  const { user_name, nick_name, email, passwd, birthdate, gender } = req.body;

  try {
    const result = await services.registerUser({
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

  const USERNAME_REGEX = /^[a-zA-Z0-9_]{4,20}$/;
  const PASSWORD_REGEX = /^[a-zA-Z0-9!@#\$%\^&\*]{6,30}$/;

  if (!USERNAME_REGEX.test(user_name)) {
    return res
      .status(400)
      .json({ message: "아이디는 영문/숫자 4~20자여야 합니다." });
  }
  if (!PASSWORD_REGEX.test(passwd)) {
    return res.status(400).json({ message: "비밀번호는 6~30자여야 합니다." });
  }

  try {
    const result = await services.loginService({ user_name, passwd });
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }
    res.cookie("access_token", result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 60 * 60 * 1000,
    });
    res.cookie("refresh_token", result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
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
  const user_id = req.user.user_id;

  try {
    const result = await services.getProfileService(user_id);
    console.log("내 프로필 데이터:", result);
    res.json(result.result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 에러" });
  }
}

// 선택 대상 프로필 조회
async function getUserProfile(req, res) {
  const { user_id } = req.params;

  try {
    const result = await services.getProfileService(user_id);
    console.log("선택 대상 프로필 데이터:", result);
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
    await services.updateMyBioService({ biography, user_name });
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
    const result = await services.updateMyImgService({ user_name, filename });
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
    await services.changeStateService(user_id);
    res.json({ message: "계정 비활성화 완료" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "계정 비활성화 실패" });
  }
}

// 사용자 조회
async function fetchAllUser(req, res) {
  try {
    const my_id = req.user.user_id;
    const searchKeyword = req.query && req.query.search ? req.query.search : "";
    console.log("Search Keyword:", searchKeyword);
    console.log("User ID:", my_id);
    const result = await services.getAllUserInfo(searchKeyword, my_id);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(400).json({ message: "가입 유저 정보 조회실패" });
  }
}

// 팔로우 추가
async function addFollow(req, res) {
  try {
    const my_id = req.user.user_id;
    const target_id = req.params.user_id;

    console.log("팔로우 요청:", { my_id, target_id });

    const result = await services.addFollowUser(my_id, target_id);
    return res.status(200).json(result);
  } catch (err) {
    console.error("팔로우 컨트롤러 에러:", err);

    return res.status(400).json({
      message: err.message || "팔로우 추가 실패",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
}

// 팔로우 취소
async function removeFollower(req, res) {
  try {
    // 1. 내 아이디 가져오기
    const follower_id = req.user.user_id;
    // 2. 상대방 아이디 가져오기
    const following_id = req.params.user_id;
    // 3. 서비스에게 전달하기
    const result = await services.removeFollowerUser(follower_id, following_id);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(400).json({ message: "팔로우 제거 실패" });
  }
}

// 팔로우 상태 조회
async function getFollowStatus(req, res) {
  try {
    const my_id = req.user.user_id;
    const target_id = req.params.user_id;
    console.log("팔로우 상태 조회 요청:", { my_id, target_id });
    const result = await services.getFollowInfo(my_id, target_id);
    console.log("팔로우 상태 조회 결과:", result);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(400).json({ message: "팔로우 상태 조회 실패" });
  }
}

module.exports = {
  register,
  login,
  updateProfile,
  resignUser,
  getMyProfile,
  updateProfileImg,
  getUserProfile,
  fetchAllUser,
  addFollow,
  removeFollower,
  getFollowStatus,
};
