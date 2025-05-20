import React from "react";
import { useNavigate, Link } from "react-router-dom";

function Logout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    alert("로그아웃 하였습니다.");
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
