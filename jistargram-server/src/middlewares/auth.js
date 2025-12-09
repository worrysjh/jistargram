const jwt = require("jsonwebtoken");
const { decryptData } = require("../utils/cryptoUtils");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  let token = null;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies && req.cookies.access_token) {
    token = req.cookies.access_token;
  }

  if (!token) {
    return res.status(401).json({ message: "토큰이 존재하지 않습니다." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = decryptData(decoded);
    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "토큰이 만료되었습니다." });
    }
    return res.status(403).json({ message: "유효하지 않은 토큰입니다." });
  }
}

module.exports = authenticateToken;
