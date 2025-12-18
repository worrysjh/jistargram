import { useNavigate } from "react-router-dom";
import useAuthStore from "store/useAuthStore";

function Logout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("서버 로그아웃 실패", err);
    }

    alert("로그아웃 하였습니다.");
    useAuthStore.getState().logout();
    navigate("/login");
  };

  return (
    <li onClick={handleLogout} style={{ cursor: "pointer" }} role="button">
      로그아웃
    </li>
  );
}

export default Logout;
