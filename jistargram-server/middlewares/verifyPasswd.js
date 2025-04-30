const pool = require("../models/db");
const bcrypt = require("bcrypt");

async function verifyPasswd(req, res, next) {
  const { passwd } = req.body;
  const userid = req.user.userid;

  try {
    const result = await pool.query(
      "SELECT passwd FROM users WHERE userid = $1",
      userid
    );

    const userpwd = result.row[0]?.passwd;
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
