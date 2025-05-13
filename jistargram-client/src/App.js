import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import PostPage from "./pages/PostPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/layout/Layout";
import PostModal from "./components/posts/PostModal";

//import Logout from "./components/auth/Logout";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import ProfileChangePage from "./pages/ProfileChangePage";

function App() {
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  return (
    <Router>
      <Routes>
        <Route
          element={
            <ProtectedRoute>
              <Layout onOpenPostModal={() => setIsPostModalOpen(true)} />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<PostPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<ProfileChangePage />} />
        </Route>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>

      {isPostModalOpen && (
        <PostModal onClose={() => setIsPostModalOpen(false)} />
      )}
    </Router>
  );
}

export default App;
