import React from "react";
import Aside from "./Aside";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

function Layout({ children }) {
  return (
    <div className="layout">
      <Aside />
      <main className="main-content">
        <Outlet />
        <Footer />
      </main>
    </div>
  );
}

export default Layout;
