import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import PostPage from "./pages/PostPage";
import UserSearchPage from "./pages/UserSearchPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/layout/Layout";
import PostUploadModal from "./components/posts/PostUploadModal";
import MessageModal from "./components/messages/MessageModal";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import ProfileChangePage from "./pages/ProfileChangePage";

function App() {
  const [isPostUploadModalOpen, setIsPostUploadModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route
          element={
            <ProtectedRoute>
              <Layout
                onOpenPostUploadModal={() => setIsPostUploadModalOpen(true)}
                onOpenMessageModal={() => setIsMessageModalOpen(true)}
              />
            </ProtectedRoute>
          }
        >
          <Route path="/home" element={<PostPage />} />
          <Route path="/search" element={<UserSearchPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<ProfileChangePage />} />
        </Route>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>

      {isPostUploadModalOpen && (
        <PostUploadModal onClose={() => setIsPostUploadModalOpen(false)} />
      )}
      {isMessageModalOpen && (
        <MessageModal onClose={() => setIsMessageModalOpen(false)} />
      )}
    </Router>
  );
}

export default App;
