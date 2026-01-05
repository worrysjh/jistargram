const path = require("path");

require("dotenv").config({
  path:
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "../.env.production")
      : path.resolve(__dirname, "../.env.development"),
});
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const userRoutes = require("./src/routes/userRoutes");
const postRoutes = require("./src/routes/postRoutes");
const likeRoutes = require("./src/routes/likeRoutes");
const authRoutes = require("./src/routes/authRoutes");
const messageRoutes = require("./src/routes/messageRoutes");

const app = express();

// 프록시 환경(Nginx)에서 client IP를 올바르게 인식하기 위한 설정
app.set("trust proxy", 1);

// 보안 헤더 설정
app.use(helmet());

// CORS 설정
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  })
);

// 미들웨어
app.use(express.json());
app.use(cookieParser());

// 라우터
app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/likes", likeRoutes);
app.use("/auth", authRoutes);
app.use("/messages", messageRoutes);

app.get("/", (_req, res) => {
  res.send("Welcome to Jistargram Server!");
});

module.exports = app;
