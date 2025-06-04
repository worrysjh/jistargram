import React, { useState } from "react";
import Aside from "./Aside";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";
import PostUploadModal from "../posts/PostUploadModal";
import MessageModal from "../messages/MessageModal";

function Layout() {
  const handleSubmit = (data) => {
    console.log("게시글 데이터", data);
  };
  const [showPostUploadModal, setShowPostUploadModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);

  return (
    <div className="layout">
      <Aside
        onOpenPostUploadModal={() => setShowPostUploadModal(true)}
        onOpenMessageModal={() => setShowMessageModal(true)}
      />
      <main className="main-content">
        <Outlet />
        <Footer />
        {showPostUploadModal && (
          <PostUploadModal
            onClose={() => setShowPostUploadModal(false)}
            onSubmit={handleSubmit}
          />
        )}
        {showMessageModal && (
          <MessageModal onClose={() => setShowMessageModal(false)} />
        )}
      </main>
    </div>
  );
}

export default Layout;
