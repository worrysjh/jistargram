import React, { useState } from "react";
import "../../styles/index.css";
import { Link } from "react-router-dom";
import { FiMenu } from "react-icons/fi";
import Logout from "../auth/Logout";

import { FaHome } from "react-icons/fa";
import { PiUserCircleDuotone } from "react-icons/pi";
import { IoIosCreate } from "react-icons/io";
import { FaSearch } from "react-icons/fa";
import { FaRegCompass } from "react-icons/fa";
import { BiMoviePlay } from "react-icons/bi";
import { FaRegMessage } from "react-icons/fa6";
import { CiHeart } from "react-icons/ci";

function Aside({ onOpenPostUploadModal }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <aside className="sidebar">
      <h2>Jistargram</h2>
      <ul>
        <Link to="/home" className="menu-link">
          <li>
            <FaHome /> 홈
          </li>
        </Link>
        <li>
          <FaSearch /> 검색
        </li>
        <li>
          <FaRegCompass /> 탐색 탭
        </li>
        <li>
          <BiMoviePlay /> 릴스
        </li>
        <li>
          <FaRegMessage /> 메시지
        </li>
        <li>
          <CiHeart /> 알림
        </li>
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
