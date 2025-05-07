const express = require("express");
const {
  register,
  login,
  updateUser,
  resignUser,
  getMyProfile,
} = require("../controllers/userController");
const authenticateToken = require("../middlewares/auth");
const verifyPasswd = require("../middlewares/verifyPasswd");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.put("/updateUser", authenticateToken, updateUser);
router.delete("/resignUser", authenticateToken, verifyPasswd, resignUser);

//마이페이지 조회
router.get("/getMyProfile", authenticateToken, getMyProfile);

module.exports = router;
