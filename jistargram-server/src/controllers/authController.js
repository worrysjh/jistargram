const jwt = require("jsonwebtoken");
const { getRefreshToken } = require("../services/auth.service");

async function refreshToken(req, res) {
  const token = req.cookies.refresh_token;
  if (!token) return res.status(401).json({ message: "Refresh token 없음" });

  try {
    //refresh 토큰 검증
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const { data, iv, tag } = decoded;

    // DB에 저장된 토큰과 일치하는지 확인
    const result = await getRefreshToken(data.user_id, token);
    if (result.rowCount === 0) {
      return res.status(403).json({ message: "유효하지 않은 refresh token" });
    }

    const newAccessToken = jwt.sign({ data, iv, tag }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    console.log("갱신성공");
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

module.exports = { refreshToken, logout };
