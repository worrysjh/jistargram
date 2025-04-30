const express = require("express");
const { register, login, updateUser } = require("../controllers/userController");
const authenticateToken = require("../middlewares/auth");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.put("/updateUser", authenticateToken, updateUser); 

module.exports = router;
