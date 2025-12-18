const express = require("express");
const {
  register,
  updateProfileBio,
  resignUser,
  getMyProfile,
  updateProfileImg,
  getUserProfile,
  fetchAllUser,
  addFollow,
  removeFollower,
  getFollowStatus,
  getFollowerList,
  getFollowingList,
} = require("../controllers/userController");
const authenticateToken = require("../middlewares/auth");
const verifyPasswd = require("../middlewares/verifyPasswd");
const upload = require("../middlewares/uploadProfileImage");

const router = express.Router();

router.post("/register", register);
// 프로필 이미지 파일 업로드 라우트
router.post(
  "/updateProfileImg",
  authenticateToken,
  upload.single("profile_img"),
  updateProfileImg
);

router.delete("/resignUser", authenticateToken, verifyPasswd, resignUser);
router.get("/getMyProfile", authenticateToken, getMyProfile);
router.patch("/updateProfileBio", authenticateToken, updateProfileBio);

router.get("/targetProfile/:user_id", getUserProfile);

router.get("/me", authenticateToken, getMyProfile);
router.get("/all", authenticateToken, fetchAllUser);

router.post("/addFollow/:user_id", authenticateToken, addFollow);
router.delete("/removeFollower/:user_id", authenticateToken, removeFollower);
router.get("/followStatus/:user_id", authenticateToken, getFollowStatus);
router.get("/followerlists/:user_id", authenticateToken, getFollowerList);
router.get("/followinglists/:user_id", authenticateToken, getFollowingList);

module.exports = router;
