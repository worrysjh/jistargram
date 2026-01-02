const http = require("http");
const app = require("./app");
const db = require("./src/models/db");
const initSocket = require("./socket");

const PORT = process.env.PORT || 4000;
const MAX_RETRIES = process.env.MAX_RETRIES || 5;
let client;

// 1. HTTP 서버 래핑
const server = http.createServer(app);

// 2. Socket.io 초기화
initSocket(server);

// 3. DB 연결 후 서버 시작
async function connectToDBWithExponentialBackoff(retry = 0) {
  const delay = Math.pow(2, retry) * 1000;
  try {
    client = await db.connect();
    server.listen(PORT, () => {});
  } catch (err) {
    console.error(
      `PostgreSQL connection failed (attempt ${retry + 1}):`,
      err.message
    );
    if (retry < MAX_RETRIES) {
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
