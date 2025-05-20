const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const likeRoutes = require("./routes/likeRoutes");
const authRoutes = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();

// public 폴더에 있는 업로드 이미지 접근 가능
app.use("/uploads", express.static("public/uploads"));

app.use(cookieParser);

// CORS 설정
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// JSON 바디 파서 (파일 업로드 multipart/form-data 에는 적용 안됨)
app.use(express.json());

// 라우터 연결
app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/likes", likeRoutes);
app.use("/auth", authRoutes);

app.get("/", (_req, res) => {
  res.send("Welcome to Jistargram Server!");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
