const jwt = require("jsonwebtoken");
const services = require("../services");

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
    res.json({
      message: "로그인 성공",
      user_id: result.user_id,
      access_token: result.access_token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "로그인 실패" });
  }
}

async function refreshToken(req, res) {
  const token = req.cookies.refresh_token;
  if (!token) return res.status(401).json({ message: "Refresh token 없음" });

  try {
    //refresh 토큰 검증
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const { data, iv, tag } = decoded;

    // DB에 저장된 토큰과 일치하는지 확인
    const result = await services.getRefreshToken(data.user_id, token);
    if (result.rowCount === 0) {
      return res.status(403).json({ message: "유효하지 않은 refresh token" });
    }

    const newAccessToken = jwt.sign({ data, iv, tag }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    return res.json({ access_token: newAccessToken });
  } catch (err) {
    res.clearCookie("refresh_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });
    console.error("토큰 갱신 실패", err);
    return res.status(403).json({ message: "토큰 갱신 실패" });
  }
}

function logout(_req, res) {
  res.clearCookie("access_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });
  res.clearCookie("refresh_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });
  res.status(200).json({ message: "로그아웃 완료" });
}

module.exports = { login, refreshToken, logout };
