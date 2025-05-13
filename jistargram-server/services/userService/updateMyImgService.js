const pool = require("../../models/db");
const path = require("path");
const fs = require("fs");

async function updateMyImgService({ username, filename }) {
  try {
    const imagePath = `/uploads/profile_imgs/${filename}`;

    // 기존 이미지 삭제
    const result = await pool.query(
      "SELECT profile_img FROM users WHERE username = $1",
      [username]
    );
    const oldImage = result.rows[0]?.profile_img;

    if (oldImage && oldImage !== "/common/img/사용자이미지.jpeg") {
      const oldImagePath = path.join(__dirname, "..", "public", oldImage);
      fs.unlink(oldImagePath, (err) => {
        if (err) {
          return {
            success: false,
            message: "기존 이미지 삭제 실패 또는 존재하지 않음:",
          };
        } else {
          return {
            success: false,
            message: `기존 이미지 삭제 성공: ${oldImagePath}`,
          };
        }
      });
    }

    // DB 업데이트
    await pool.query("UPDATE users SET profile_img = $1 WHERE username = $2", [
      imagePath,
      username,
    ]);

    return { success: true };
  } catch (err) {
    throw err;
  }
}

module.exports = { updateMyImgService };
