import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("로그인이 필요한 페이지입니다.");
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
