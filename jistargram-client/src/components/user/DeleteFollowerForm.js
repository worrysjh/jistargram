import "styles/DeleteFollowerForm.css";
import { getImageUrl } from "utils/imageUtils";

function DeleteFollowerForm({ user, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-avatar">
          {user.profile_img ? (
            <img
              src={getImageUrl(user.profile_img)}
              alt={user.user_name}
            />
          ) : (
            <div className="default-avatar"></div>
          )}
        </div>

        <h3 className="modal-title">팔로워를 삭제하시겠어요?</h3>
        <p className="modal-description">
          {user.user_name}님은 회원님의 팔로워 리스트에서 삭제될 수 있습니다.
        </p>

        <button className="modal-button delete" onClick={onConfirm}>
          삭제
        </button>
        <button className="modal-button cancel" onClick={onCancel}>
          취소
        </button>
      </div>
    </div>
  );
}

export default DeleteFollowerForm;
