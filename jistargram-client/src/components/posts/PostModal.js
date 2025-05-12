import React, { useState } from "react";
import ReactDOM from "react-dom";
import "../../styles/PostModal.css";

function PostModal({ username, onClose, onSubmit }) {
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImage(URL.createObjectURL(file));
  };

  const handleSubmit = () => {
    onSubmit({ image, caption });
    setImage(null);
    setCaption("");
    onClose();
  };

  const modalContent = (
    <div className="modal-overlay" onClick={onClose}>
      <div className="post-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <button className="back-btn" onClick={onClose}>
            X
          </button>
          <h3 className="modal-title">새 게시물 만들기</h3>
          <button className="post-submit-btn" onClick={handleSubmit}>
            작성하기
          </button>
        </div>

        <div className="modal-body">
          <div className="left">
            {image ? (
              <img src={image} alt="미리보기" />
            ) : (
              <div className="upload-placeholder">이미지를 선택하세요</div>
            )}
          </div>
          <div className="right">
            <div className="user-info">
              <img src="/common/img/사용자이미지.jpeg" alt="프로필" />
              <span>{username}</span>
            </div>
            <textarea
              placeholder="게시글 문구 입력..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={2200}
            />
            <div className="counter">{caption.length}/2200</div>
          </div>
        </div>

        <div className="modal-footer">
          <label className="upload-label">
            <input type="file" accept="image/*" onChange={handleImageChange} />
            사진 추가
          </label>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(
    modalContent,
    document.getElementById("modal-root")
  );
}

export default PostModal;
