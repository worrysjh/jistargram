const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/profile_imgs/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = req.user.userid + ext;
    cb(null, filename);
  },
});

const upload = multer({ storage });

module.exports = upload;
