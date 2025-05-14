// 좋아요 생성
async function pressLike(req, res){
    const {user_id, target_type, target_id} = req.body;

    try{
        await pressLikeController(user_id, target_type, target_id);
        res.status(201).json({ message: "좋아요 등록 성공" });
    } catch(err) {
        res.status(500).json({ message: "좋아요 등록 실패" });
    }
}

// 좋아요 취소
async function cancleLike(req, res){
    const {like_id} = req.body;

    try{
        await cancleLikeController(like_id);
        res.status(201).json({ message: "좋아요 등록취소 성공" });
    } catch(err) {
        res.status(500).json({ message: "좋아요 등록취소 실패" });
    }
}

// 좋아요 카운팅
async function countLike(req, res){
    const target_id = req.body;
    try{
        const result = await countLikeService(target_id);
        res.json(result.result);
    } catch(err) {
        res.status(500).json({ message: "좋아요 카운팅 실패" });
    }
}

module.exports = {pressLike, cancleLike, countLike};