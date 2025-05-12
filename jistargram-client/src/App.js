import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/layout/Layout";
import PostModal from "./components/posts/PostModal";

import Logout from "./components/auth/Logout";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import ProfileChangePage from "./pages/ProfileChangePage";

//임시 페이지 이동용 네비게이터 - 삭제예정
function Navbar() {
  const token = localStorage.getItem("token");
  return (
    <nav>
      <Link to="/">홈</Link> | {""}
      {!token ? <Link to="/login">로그인</Link> : <Logout />} |
      <Link to="/register">회원가입</Link>
    </nav>
  );
}

function App() {
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route
          element={
            <ProtectedRoute>
              <Layout onOpenPostModal={() => setIsPostModalOpen(true)} />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<ProfileChangePage />} />
        </Route>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>

      {isPostModalOpen && (
        <PostModal onClose={() => setIsPostModalOpen(false)} />
      )}
    </Router>
  );
}

export default App;
