import React from "react";
import { useNavigate, Link } from "react-router-dom";

function Logout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <Link
      to="#"
      onClick={(e) => {
        e.preventDefault();
        handleLogout();
      }}
    >
      로그아웃
    </Link>
  );
}

export default Logout;
