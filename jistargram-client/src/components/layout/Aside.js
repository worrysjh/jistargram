import React, { useState } from "react";
import "../../styles/index.css";
import { Link } from "react-router-dom";
import { FiMenu } from "react-icons/fi";
import Logout from "../auth/Logout";

import { FaHome } from "react-icons/fa";
import { PiUserCircleDuotone } from "react-icons/pi";
import { IoIosCreate } from "react-icons/io";

function Aside({ onOpenPostUploadModal }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <aside className="sidebar">
      <h2>Jistargram</h2>
      <ul>
        <Link to="/" className="menu-link">
          <li>
            <FaHome /> 홈
          </li>
        </Link>
        <li>검색</li>
        <li>탐색 탭</li>
        <li>릴스</li>
        <li>메시지</li>
        <li>알림</li>
        <li onClick={onOpenPostUploadModal}>
          <IoIosCreate /> 만들기
        </li>
        <Link to="/profile" className="menu-link">
          <li>
            <PiUserCircleDuotone /> 프로필
          </li>
        </Link>
      </ul>

      <div className="sidebar-bottom">
        <div className="hamburger" onClick={toggleMenu}>
          <FiMenu size={24} /> 더 보기
        </div>

        {menuOpen && (
          <div className="dropdown-menu">
            <ul>
              <li>모드 설정</li>
              <hr className="menu-divider" />
              <li>
                <Logout />
              </li>
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
}

export default Aside;
