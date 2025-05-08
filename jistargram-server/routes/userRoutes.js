const express = require("express");
const {
  register,
  login,
  updateProfile,
  resignUser,
  getMyProfile,
  updateProfileImg,
} = require("../controllers/userController");

const authenticateToken = require("../middlewares/auth");
const verifyPasswd = require("../middlewares/verifyPasswd");
const upload = require("../middlewares/upload");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

// 파일 업로드 라우트
router.post(
  "/updateProfileImg",
  authenticateToken,
  upload.single("profile_img"),
  updateProfileImg
);

router.delete("/resignUser", authenticateToken, verifyPasswd, resignUser);
router.get("/getMyProfile", authenticateToken, getMyProfile);
router.patch("/updateProfile", authenticateToken, updateProfile);

module.exports = router;
