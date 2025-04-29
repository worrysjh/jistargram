const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const app = express();
require("dotenv").config();

//미들웨어 설정
app.use(cors());
app.use(express.json()); // Json 요청 처리

//라우터 연결
app.use("/users", userRoutes);

//기본 라우트
app.get("/", (req, res) => {
  res.send("Welcome to Jistargram Server!");
});

// 서버 시작
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
