const express = require("express");
const {
  register,
  login,
  updateProfile,
  resignUser,
  getMyProfile,
} = require("../controllers/userController");
const authenticateToken = require("../middlewares/auth");
const verifyPasswd = require("../middlewares/verifyPasswd");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.delete("/resignUser", authenticateToken, verifyPasswd, resignUser);

//마이페이지 조회
router.get("/getMyProfile", authenticateToken, getMyProfile);
//마이페이지 자기소개 수정
router.patch("/updateProfile", authenticateToken, updateProfile);

module.exports = router;
