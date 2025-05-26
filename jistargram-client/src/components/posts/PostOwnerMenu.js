import React from "react";
import { FiMenu } from "react-icons/fi";

// 자신의 게시글에 토글추가(수정/삭제)
function PostOwnerMenu({
  post,
  isOwner,
  menuOpenFor,
  toggleMenu,
  onUpdate,
  onDelete,
}) {
  if (!isOwner) return null;

  return (
    <div className="owner-menu">
      <div className="hamburger" onClick={() => toggleMenu(post.post_id)}>
        <FiMenu size={12} />
      </div>
      {menuOpenFor === post.post_id && (
        <div className="owner-dropdown-menu">
          <ul>
            <li onClick={() => onUpdate(post)}>수정하기</li>
            <hr className="menu-divider" />
            <li onClick={() => onDelete(post.post_id)}>삭제하기</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default PostOwnerMenu;
