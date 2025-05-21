const crypto = require("crypto");

const keyHex = process.env.ENCRYPTION_KEY?.trim();
if (!keyHex) throw new Error("ENCRYPTION_KEY is missing");

const ENCRYPTION_KEY = Buffer.from(keyHex, "hex");
if (ENCRYPTION_KEY.length !== 32) {
  throw new Error("ENCRYPTION_KEY must be 32 bytes (64 hex characters)");
}

const ALGORITHM = "aes-256-gcm";

// 암호화 함수
function encryptData(dataObj) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

  let encrypted = cipher.update(JSON.stringify(dataObj), "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  return {
    iv: iv.toString("hex"),
    data: encrypted,
    tag: authTag.toString("hex"),
  };
}

// 복호화 함수
function decryptData({ data, iv, tag }) {
  if (!data || !iv || !tag) {
    console.error("decryptData 인자 누락:", { data, iv, tag });
    throw new Error("복호화 인자 오류");
  }

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    ENCRYPTION_KEY,
    Buffer.from(iv, "hex")
  );
  decipher.setAuthTag(Buffer.from(tag, "hex"));

  let decrypted = decipher.update(data, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return JSON.parse(decrypted);
}

module.exports = { encryptData, decryptData };
