const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "token does not exist" });
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.stutus(403).json({ message: "token is invalid" });

    req.user = user;
    next();
  });
}

module.exports = authenticateToken;
