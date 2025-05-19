const pool = require("../models/db");
const bcrypt = require("bcrypt");

//비밀번호 검사 로직
async function verifyPasswd(req, res, next) {
  const { passwd } = req.body;
  const user_name = req.user.user_name;

  try {
    const result = await pool.query(
      "SELECT passwd FROM users WHERE user_name = $1",
      [user_name]
    );

    const userpwd = result.rows[0]?.passwd;
    if (!userpwd) return res.status(404).json({ message: "User not found" });

    const valid = await bcrypt.compare(passwd, userpwd);
    if (!valid) return res.status(401).json({ message: "Incorrect Password" });

    next();
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Password verification failed" });
  }
}

module.exports = verifyPasswd;
