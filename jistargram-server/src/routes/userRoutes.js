const express = require("express");
const {
  register,
  login,
  updateProfile,
  resignUser,
  getMyProfile,
  updateProfileImg,
  getUserProfile,
  fetchAllUser,
} = require("../controllers/userController");

const authenticateToken = require("../middlewares/auth");
const verifyPasswd = require("../middlewares/verifyPasswd");
const upload = require("../middlewares/uploadProfileImage");

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

router.get("/targetProfile/:user_id", getUserProfile);

router.get("/me", authenticateToken, getMyProfile);
router.get("/all", authenticateToken, fetchAllUser);

module.exports = router;
