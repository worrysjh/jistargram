import React, { useState } from "react";
import Aside from "./Aside";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";
import PostModal from "../posts/PostModal";

function Layout() {
  const user_name = "사용자이름";
  const handleSubmit = (data) => {
    console.log("게시글 데이터", data);
  };
  const [showPostModal, setShowPostModal] = useState(false);

  return (
    <div className="layout">
      <Aside onOpenPostModal={() => setShowPostModal(true)} />
      <main className="main-content">
        <Outlet />
        <Footer />
        {showPostModal && (
          <PostModal
            user_name={user_name}
            onClose={() => setShowPostModal(false)}
            onSubmit={handleSubmit}
          />
        )}
      </main>
    </div>
  );
}

export default Layout;
