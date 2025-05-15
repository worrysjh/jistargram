import React, { useState } from "react";
import ReactDOM from "react-dom";
import "../../styles/PostUploadModal.css";
//import { updatePost } from "../../actions/post/updatePost";
import { getUserFromToken } from "../../utils/getUserFromToken";
import { useNavigate } from "react-router-dom";

function PostUpdateModal({ post, onClose, onUpdate }) {
  const [image, setImage] = useState(`http://localhost:4000${post.media_url}`);
  const [selectedFile, setSelectedFile] = useState(null);
  const [content, setContent] = useState(post.content);
  const currentUser = getUserFromToken();

  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setSelectedFile(file);
    }
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    if (selectedFile) {
      formData.append("image", selectedFile);
    }
    formData.append("existingImage", post.media_url);
    formData.append("content", content);
    formData.append("post_id", post.post_id);
    const success = await onUpdate(formData);
    if (success) {
      onClose();
      navigate("/", { replace: true });
      window.location.reload();
    }
  };

  const modalContent = (
    <div className="modal-overlay" onClick={onClose}>
      <div className="post-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <button className="back-btn" onClick={onClose}>
            X
          </button>
          <h3 className="modal-title">게시물 수정하하기</h3>
          <button className="post-submit-btn" onClick={handleSubmit}>
            수정하기
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
              <span>{currentUser.user_name} 님의 게시글 수정!</span>
            </div>
            <textarea
              placeholder="게시글 수정 문구 입력..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={2200}
            />
            <div className="counter">{content.length}/2200</div>
          </div>
        </div>

        <div className="modal-footer">
          <label className="upload-label">
            <input type="file" accept="image/*" onChange={handleImageChange} />
            사진 변경
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

export default PostUpdateModal;
