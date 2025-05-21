const jwt = require("jsonwebtoken");
const { decryptData } = require("../utils/cryptoUtils");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const access_token = authHeader && authHeader.split(" ")[1];
  if (!access_token)
    return res.status(401).json({ message: "access_token does not exist" });

  try {
    const decoded = jwt.verify(access_token, process.env.JWT_SECRET);
    const user = decryptData(decoded);
    req.user = user;
    next();
  } catch (err) {
    console.error("토큰 인증 실패: ", err.message);
    return res.status(403).json({ message: "access_token is invalid" });
  }
}

module.exports = authenticateToken;
