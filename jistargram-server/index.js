const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const db = require("./src/models/db");
const { createClient } = require("redis");
const { createAdapter } = require("@socket.io/redis-adapter");
const services = require("./src/services");
const { validateRoomId } = require("./src/utils/roomUtils");
const jwt = require("jsonwebtoken");
const { decryptData } = require("./src/utils/cryptoUtils");

const PORT = process.env.PORT || 4000;
const MAX_RETRIES = process.env.MAX_RETRIES || 5;
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

// 3. Redis 클라이언트 연결 및 Socket.io 어댑터 설정
Promise.all([pubClient.connect(), subClient.connect()])
  .then(() => {
    console.log("Connected to Redis for Socket.io adapter");

    // Socket.io 어댑터 적용
    io.adapter(createAdapter(pubClient, subClient));

    // Socket.io 인증 미들웨어
    io.use((socket, next) => {
      try {
        // 쿠키 또는 auth 쿼리 파라미터에서 토큰 추출
        const token =
          socket.handshake.auth?.token ||
          socket.handshake.headers?.cookie
            ?.split("; ")
            .find((c) => c.startsWith("access_token="))
            ?.split("=")[1];

        if (!token) {
          return next(new Error("인증 토큰이 없습니다."));
        }

        // JWT 검증
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = decryptData(decoded);

        // 소켓에 인증된 사용자 정보 저장
        socket.user = user;
        next();
      } catch (err) {
        console.error("Socket 인증 실패:", err.message);
        next(new Error("인증에 실패했습니다."));
      }
    });

    // Socket 이벤트 핸들러
    io.on("connection", (socket) => {
      console.log(
        `사용자 연결됨: ${socket.id} (user_id: ${socket.user?.user_id})`
      );

      socket.on("join_room", (data) => {
        const { roomId, userId, partnerId } = data;
        const authenticatedUserId = socket.user?.user_id;

        // 필수 파라미터 검증
        if (!roomId || !userId || !partnerId) {
          console.error("join_room 실패: 필수 파라미터 누락", data);
          socket.emit("join_room_error", {
            message: "roomId, userId, partnerId가 필요합니다.",
          });
          return;
        }

        // 인증된 사용자 ID와 요청한 userId가 일치하는지 확인 (사칭 방지)
        if (authenticatedUserId !== userId) {
          console.error(
            `join_room 실패: 사용자 사칭 시도 (인증된 사용자: ${authenticatedUserId}, 요청 사용자: ${userId})`
          );
          socket.emit("join_room_error", {
            message: "권한이 없습니다.",
          });
          return;
        }

        // roomId가 두 사용자 ID로 생성된 것인지 검증
        if (!validateRoomId(roomId, userId, partnerId)) {
          console.error(
            `join_room 실패: 유효하지 않은 roomId (${roomId}) for users (${userId}, ${partnerId})`
          );
          socket.emit("join_room_error", {
            message: "유효하지 않은 방 ID입니다.",
          });
          return;
        }

        // 검증 성공 - 방 입장
        socket.join(roomId);
        console.log(`${roomId} 방 입장 - 사용자: ${userId}`);
      });

      socket.on("leave_room", async (data) => {
        const { room_id, user_id } = data;

        try {
          // 단순히 소켓 방에서만 나가기
          // 읽음 처리(left_at 업데이트)는 ChatWindow에서 명시적으로 markMessagesAsRead API 호출 시에만 수행
          socket.leave(room_id);
          console.log(`${user_id}가 ${room_id} 방 퇴장`);
        } catch (err) {
          console.error(
            `방 퇴장 중 오류 (room: ${room_id}, user: ${user_id}):`,
            err
          );
        }
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
