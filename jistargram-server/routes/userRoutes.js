const express = require("express");
const {
  register,
  login,
  updateUser,
  resignUser,
} = require("../controllers/userController");
const authenticateToken = require("../middlewares/auth");
const verifyPasswd = require("../middlewares/verifyPasswd");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.put("/updateUser", authenticateToken, updateUser);
router.delete("/resignUser", authenticateToken, verifyPasswd, resignUser);

module.exports = router;
