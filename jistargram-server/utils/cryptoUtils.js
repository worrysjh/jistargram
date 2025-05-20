const crypto = require("crypto");

const keyHex = process.env.ENCRYPTION_KEY?.trim();
if (!keyHex) throw new Error("ENCRYPTION_KEY is missing");

const ENCRYPTION_KEY = Buffer.from(keyHex, "hex");
if (ENCRYPTION_KEY.length !== 32) {
  throw new Error("ENCRYPTION_KEY must be 32 bytes (64 hex characters)");
}
const ALGORITHM = "aes-256-gcm";

function encryptData(dataObj) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(JSON.stringify(dataObj), "utf-8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  return {
    iv: iv.toString("hex"),
    data: encrypted,
    tag: authTag.toString("hex"),
  };
}

function decryptData(encryptedData, iv_hex, tag_hex) {
  const iv = Buffer.from(iv_hex, "hex");
  const authTag = Buffer.from(tag_hex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf-8");

  return JSON.parse(decrypted);
}

module.exports = { encryptData, decryptData };
