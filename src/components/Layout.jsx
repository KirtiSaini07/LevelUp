import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import LevelUpOverlay from './LevelUpOverlay';
import './Layout.css';

const Layout = ({ children }) => {
  return (
    <div className="layout-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="page-container animate-slide-up">
          {children}
        </main>
      </div>
      <LevelUpOverlay />
    </div>
  );
};

export default Layout;
