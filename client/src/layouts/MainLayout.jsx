import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import './MainLayout.css';

const MainLayout = () => {
  return (
    <div className="bb-app-layout">
      <Navbar />
      <main className="bb-main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
