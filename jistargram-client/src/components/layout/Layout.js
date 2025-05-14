import React, { useState } from "react";
import Aside from "./Aside";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";
import PostUploadModal from "../posts/PostUploadModal";

function Layout() {
  const user_name = "사용자이름";
  const handleSubmit = (data) => {
    console.log("게시글 데이터", data);
  };
  const [showPostUploadModal, setShowPostUploadModal] = useState(false);

  return (
    <div className="layout">
      <Aside onOpenPostUploadModal={() => setShowPostUploadModal(true)} />
      <main className="main-content">
        <Outlet />
        <Footer />
        {showPostUploadModal && (
          <PostUploadModal
            user_name={user_name}
            onClose={() => setShowPostUploadModal(false)}
            onSubmit={handleSubmit}
          />
        )}
      </main>
    </div>
  );
}

export default Layout;
