const multer = require("multer");
const supabase = require("../config/supabase");

// 메모리 스토리지 사용
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 임시 5MB 제한
  },
  fileFilter: (_req, file, cb) => {
    // 이미지 파일만 허용
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("이미지 파일만 업로드 가능합니다."), false);
    }
  },
});

// Supabase Storage에 프로필 이미지 업로드
async function uploadProfileToSupabase(req, res, next) {
  if (!req.file) {
    return next();
  }

  try {
    const file = req.file;
    const fileExt = file.originalname.split(".").pop();
    const fileName = `${req.user.user_name}_${Date.now()}.${fileExt}`;
    const filePath = `profile_imgs/${fileName}`;

    // Supabase Storage에 바로 업로드
    const { data, error } = await supabase.storage
      .from("jistargram-images")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return res.status(500).json({ message: "프로필 이미지 업로드 실패" });
    }

    // 공개 URL 생성
    const {
      data: { publicUrl },
    } = supabase.storage.from("jistargram-images").getPublicUrl(filePath);

    // req.file에 Supabase 정보 추가
    req.file.supabasePath = filePath;
    req.file.supabaseUrl = publicUrl;

    next();
  } catch (err) {
    console.error("Upload middleware error:", err);
    res.status(500).json({ message: "프로필 이미지 업로드 중 오류 발생" });
  }
}

module.exports = { upload, uploadProfileToSupabase };
