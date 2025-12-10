import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { authFetch } from "../utils/authFetch";

function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await authFetch(
          `${process.env.REACT_APP_API_URL}/users/getMyProfile`
        );
        if (!mounted) return;
        if (res && res.ok) {
          setAuthed(true);
        } else {
          setAuthed(false);
        }
      } catch (err) {
        setAuthed(false);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return null;
  if (!authed) {
    alert("로그인이 필요한 페이지입니다.");
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default ProtectedRoute;
