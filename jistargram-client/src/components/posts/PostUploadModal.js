import { useState } from "react";
import ReactDOM from "react-dom";
import "styles/PostUploadModal.css";
import { uploadPost } from "actions/post/postActions";

function PostUploadModal({ onClose, onSubmit }) {
  const [image, setImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [content, setContent] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setSelectedFile(file);
    }
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    const navigate = "/home";
    if (!selectedFile) {
      alert("사진을 한장 등록하여야 합니다");
      return;
    }
    formData.append("image", selectedFile);
    formData.append("content", content);
    const success = await uploadPost(formData, navigate);
    if (success) {
      onClose();
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
              <span>게시글 내용 작성하기</span>
            </div>
            <textarea
              placeholder="게시글 문구 입력..."
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

export default PostUploadModal;
