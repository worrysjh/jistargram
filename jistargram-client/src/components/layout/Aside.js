import React from "react";
import "../../styles/index.css";
import { Link } from "react-router-dom";

function Aside() {
  return (
    <aside className="sidebar">
      <h2>Jistargram</h2>
      <ul>
        <Link to="/">
          <li>홈</li>
        </Link>
        <li>검색</li>
        <li>탐색 탭</li>
        <li>릴스</li>
        <li>메시지</li>
        <li>알림</li>
        <li>만들기</li>
        <Link to="/profile">
          <li>프로필</li>
        </Link>
      </ul>
    </aside>
  );
}

export default Aside;
