const services = require("../services");

// 좋아요 check 여부 판별
async function check(req, res) {
  const user_id = req.user.user_id;
  const { target_type, target_id } = req.body;

  try {
    const liked = await services.checkLike(user_id, target_type, target_id);
    res.json({ liked });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// 좋아요 생성
async function add(req, res) {
  const user_id = req.user.user_id;
  const { target_type, target_id } = req.body;

  try {
    await services.addLike(user_id, target_type, target_id);
    res.status(201).json({ message: "좋아요 등록 성공" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// 좋아요 취소
async function remove(req, res) {
  const user_id = req.user.user_id;
  const { target_type, target_id } = req.body;

  try {
    await services.removeLike(user_id, target_type, target_id);
    res.status(201).json({ message: "좋아요 등록취소 성공" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// 좋아요 카운팅
async function count(req, res) {
  const { target_type, target_id } = req.body;
  const result = await services.countLike(target_type, target_id);

  try {
    const count = Number(result.result.rows[0].count);
    res.json({ count });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Interner Server Error" });
  }
}

module.exports = { check, add, remove, count };
