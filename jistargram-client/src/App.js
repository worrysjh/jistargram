import React from "react";
import "./styles/index.css";

function App() {
  return (
    <div className="layout">
      {/* 왼쪽 사이드 메뉴 */}
      <aside className="sidebar">
        <h2>Jistargram</h2>
        <ul>
          <li>🏠 홈</li>
          <li>🔍 검색</li>
          <li>🧭 탐색 탭</li>
          <li>🎞 릴스</li>
          <li>✉ 메시지</li>
          <li>❤️ 알림</li>
          <li>➕ 만들기</li>
          <li>👤 프로필</li>
        </ul>
      </aside>

      {/* 오른쪽 추천 유저 리스트 */}
      <main className="main-content">
        <h3>회원님을 위한 추천</h3>
        
        <ul className="recommend-list">
          <li className="user-card">
            <img src="/default-profile.png" alt="user" />
            <div className="info">
              <b>user1</b>
              <span>회원님을 위한 추천</span>
            </div>
            <button className="follow-btn">팔로우</button>
          </li>
          
          {/* 더 추가 가능 */}
        </ul>
      </main>
    </div>
  );
}

export default App;
