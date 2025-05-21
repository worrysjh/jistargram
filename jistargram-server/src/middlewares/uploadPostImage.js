const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    cb(null, "public/uploads/post_imgs/");
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + ext;
    cb(null, uniqueName);
  },
});

const postImgUpload = multer({ storage });

module.exports = postImgUpload;
