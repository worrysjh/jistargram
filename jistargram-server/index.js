// index.js
const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const db = require("./src/models/db");
const { createClient } = require("redis");
const { createAdapter } = require("@socket.io/redis-adapter");

const PORT = process.env.PORT || 4000;
const MAX_RETRIES = 5;
let client;

// 1. HTTP 서버 래핑
const server = http.createServer(app);

// 2. Socket.io 인스턴스 생성
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
    credentials: true,
  },
});

const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()])
  .then(() => {
    console.log("Connected to Redis for Socket.io adapter");

    // Socket.io 어댑터 적용
    io.adapter(createAdapter(pubClient, subClient));

    // Socket 이벤트 핸들러
    io.on("connection", (socket) => {
      console.log("사용자 연결됨: ", socket.id);

      socket.on("join_room", (room_id) => {
        socket.join(room_id);
        console.log(`${room_id} 방 입장`);
      });

      socket.on("leave_room", (room_id) => {
        socket.leave(room_id);
        console.log(`${room_id} 방 퇴장`);
      });

      socket.on("send_message", (message) => {
        console.log(`[${socket.id}] 메시지 전송 및 Redis 발행: `, message);
        io.to(message.roomId).emit("receive_message", message);
      });

      socket.on("disconnect", () => {
        console.log("사용자 연결 해제:", socket.id);
      });
    });
  })
  .catch((err) => {
    console.error("Redis 연결 실패:", err);
    process.exit(1);
  });

// 4. DB 연결 후 서버 시작 (재시도 포함)
async function connectToDBWithExponentialBackoff(retry = 0) {
  const delay = Math.pow(2, retry) * 1000;
  try {
    client = await db.connect();
    console.log("Connected to PostgreSQL");

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error(
      `PostgreSQL connection failed (attempt ${retry + 1}):`,
      err.message
    );
    if (retry < MAX_RETRIES) {
      console.log(`Retrying in ${delay / 1000} seconds...`);
      setTimeout(() => connectToDBWithExponentialBackoff(retry + 1), delay);
    } else {
      console.error("All DB connection attempts failed. Exiting.");
      process.exit(1);
    }
  } finally {
    if (client) client.release();
  }
}

connectToDBWithExponentialBackoff();
