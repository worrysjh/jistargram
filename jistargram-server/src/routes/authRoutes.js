const express = require("express");
const {
  login,
  refreshToken,
  logout,
  sendVerificationCode,
  verifyCode,
} = require("../controllers/authController");
const router = express.Router();

router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.post("/sendVerification", sendVerificationCode);
router.post("/verifyCode", verifyCode);

module.exports = router;
