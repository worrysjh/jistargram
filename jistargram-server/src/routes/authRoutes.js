const express = require("express");
const { refreshToken, logout } = require("../controllers/authController");
const router = express.Router();

router.post("/refresh", refreshToken);
router.post("/logout", logout);

module.exports = router;
