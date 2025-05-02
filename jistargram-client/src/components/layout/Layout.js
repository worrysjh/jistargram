import React from "react";
import Aside from "./Aside";
import Footer from "./Footer";

function Layout({ children }) {
  return (
    <div className="layout">
      <Aside />
      <main className="main-content">
        {children}
        <Footer />
      </main>
    </div>
  );
}

export default Layout;
