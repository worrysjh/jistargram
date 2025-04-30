import React from "react";
import "./styles/index.css";

function App() {
  return (
    <div className="layout">
      {/* 왼쪽 사이드 메뉴 */}
      <aside className="sidebar">
        <h2>Jistargram</h2>
        <ul>
          <li>홈</li>
          <li>검색</li>
          <li>탐색 탭</li>
          <li>릴스</li>
          <li>메시지</li>
          <li>알림</li>
          <li>만들기</li>
          <li>프로필</li>
        </ul>
      </aside>

      {/* 오른쪽 추천 유저 리스트 */}
      <main className="main-content">
        {/* 여기에 메인 피드들 출력 */}
        {/* 유저 사진 */} {/* 닉네임 */}{/* 게시일자 */} {/* --- */}
        {/* 피드 사진 */}
        {/* 좋아요 */} {/* 댓글 */}
        {/* 좋아요 수 */}
        {/* 게시글 내용 */}
        {/* 댓글 n개 보기 */}
        {/* 댓글 달기 */}
        {/* 댓글 */}
        <div>
          <ul>
            <li>여기에 메인 피드들 출력</li>
          </ul>
        </div>

      </main>
    </div>
  );
}

export default App;
