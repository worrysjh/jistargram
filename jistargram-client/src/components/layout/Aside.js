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

function Aside({ onOpenPostUploadModal, onOpenMessageModal }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <aside className="sidebar">
      <h2 className="logo" data-tooltip="Jistargram">
        <span className="short-text">J</span>
        <span className="full-text">istargram</span>
      </h2>
      <ul>
        <Link to="/home" className="menu-link">
          <li className="menu-item" data-tooltip="홈">
            <FaHome className="menu-icon" />
            <span className="label">홈</span>
          </li>
        </Link>
        <li className="menu-item" data-tooltip="검색">
          <FaSearch className="menu-icon" />
          <span className="label">검색</span>
        </li>
        <li className="menu-item" data-tooltip="탐색 탭">
          <FaRegCompass className="menu-icon" />
          <span className="label">탐색 탭</span>
        </li>
        <li className="menu-item" data-tooltip="릴스">
          <BiMoviePlay className="menu-icon" />
          <span className="label">릴스</span>
        </li>

        <li
          onClick={onOpenMessageModal}
          className="menu-item"
          data-tooltip="메시지"
        >
          <FaRegMessage className="menu-icon" />
          <span className="label">메시지</span>
        </li>

        <li className="menu-item" data-tooltip="알림">
          <CiHeart className="menu-icon" />
          <span className="label">알림</span>
        </li>

        <li
          onClick={onOpenPostUploadModal}
          className="menu-item"
          data-tooltip="만들기"
        >
          <IoIosCreate className="menu-icon" />
          <span className="label">만들기</span>
        </li>

        <Link to="/profile" className="menu-link">
          <li className="menu-item" data-tooltip="프로필">
            <PiUserCircleDuotone className="menu-icon" />
            <span className="label">프로필</span>
          </li>
        </Link>
      </ul>

      <div className="sidebar-bottom">
        <div
          className="hamburger menu-item"
          data-tooltip="더 보기"
          onClick={toggleMenu}
        >
          <FiMenu size={24} className="menu-icon" />
          <span className="label">더 보기</span>
        </div>

        {menuOpen && (
          <div className="dropdown-menu">
            <ul>
              <li>모드 설정</li>
              <hr className="menu-divider" />
              <Logout />
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
}

export default Aside;
