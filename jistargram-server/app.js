const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
require("dotenv").config();

const app = express();

// ✅ public 폴더에 있는 업로드 이미지 접근 가능
app.use("/uploads", express.static("public/uploads"));

// ✅ CORS 설정
app.use(cors());

// ✅ JSON 바디 파서 (파일 업로드 multipart/form-data 에는 적용 안됨)
app.use(express.json());

// ✅ 라우터 연결
app.use("/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to Jistargram Server!");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
