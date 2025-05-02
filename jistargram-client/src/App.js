import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import ProtectedRoute from "./components/ProtectedRoute";

import Logout from "./components/Logout";
import RegisterPage from "./pages/RegisterPage";

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
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </Router>
  );
}

export default App;
