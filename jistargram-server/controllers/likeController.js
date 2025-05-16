const {
  checkLike,
  addLike,
  removeLike,
  countLike,
} = require("../services/like.service");

// 좋아요 check 여부 판별
async function check(req, res) {
  const user_id = req.user.user_id;
  const { target_type, target_id } = req.body;

  const liked = await checkLike(user_id, target_type, target_id);
  res.json({ liked });
}

// 좋아요 생성
async function add(req, res) {
  const user_id = req.user.user_id;
  const { target_type, target_id } = req.body;

  await addLike(user_id, target_type, target_id);
  res.status(201).json({ message: "좋아요 등록 성공" });
}

// 좋아요 취소
async function remove(req, res) {
  const user_id = req.user.user_id;
  const { target_type, target_id } = req.body;
  await removeLike(user_id, target_type, target_id);
  res.status(201).json({ message: "좋아요 등록취소 성공" });
}

// 좋아요 카운팅
async function count(req, res) {
  const { target_type, target_id } = req.body;
  const result = await countLike(target_type, target_id);
  const count = Number(result.result.rows[0].count);
  res.json({ count });
}

module.exports = { check, add, remove, count };
