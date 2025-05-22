import { useEffect, useState } from "react";
import { authFetch } from "../../utils/authFetch";
import { FcLike } from "react-icons/fc";
import { RiDislikeLine } from "react-icons/ri";

function LikeButton({ target_id, target_type }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    const fetchLikeStatus = async () => {
      if (!target_id || !target_type) return;

      try {
        // 1. 좋아요 여부 확인
        const res = await authFetch(
          `${process.env.REACT_APP_API_URL}/likes/check`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ target_id, target_type }),
          }
        );

        const data = await res.json();
        setLiked(data.liked);

        // 2. 좋아요 수 확인
        const countRes = await authFetch(
          `${process.env.REACT_APP_API_URL}/likes/count`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ target_id, target_type }),
          }
        );

        const countData = await countRes.json();
        setLikeCount(countData.count);
      } catch (err) {
        console.error("좋아요 상태 불러오기 실패:", err);
      }
    };

    fetchLikeStatus();
  }, [target_id, target_type]);

  const toggleLike = async () => {
    try {
      const method = liked ? "DELETE" : "POST";
      const endpoint = liked
        ? `${process.env.REACT_APP_API_URL}/likes/remove`
        : `${process.env.REACT_APP_API_URL}/likes/add`;

      const res = await authFetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_id, target_type }),
      });

      if (!res.ok) throw new Error("좋아요 요청 실패");

      // 상태 반영
      setLiked((prev) => !prev);
      setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
    } catch (err) {
      console.error("좋아요 처리 실패:", err);
    }
  };

  return (
    <span
      onClick={toggleLike}
      style={{
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}
    >
      {liked ? <FcLike size={20} /> : <RiDislikeLine size={20} />}
      <span style={{ fontSize: "14px", color: "gray" }}>{likeCount}</span>
    </span>
  );
}

export default LikeButton;
