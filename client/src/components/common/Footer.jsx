import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="bb-footer-wrapper">
      <div className="bb-footer-container container">
        <div className="bb-footer-grid">
          {/* Brand Info */}
          <div className="bb-footer-brand-col">
            <div className="bb-footer-brand">
              <span className="bb-footer-icon">📖</span>
              <span className="bb-footer-name">BookBridge</span>
            </div>
            <p className="bb-footer-about">
              A student-powered literary sanctuary. Seamlessly buy, sell, borrow, lend, and
              exchange pre-loved books across campus corridors.
            </p>
            <div className="bb-footer-tag">
              <span>Theme: Paper & Ink • Modern Digital Library</span>
            </div>
          </div>

          {/* Module Quick Links */}
          <div className="bb-footer-col">
            <h4 className="bb-footer-title">Modules</h4>
            <ul className="bb-footer-links">
              <li>
                <Link to="/">1. Home & Discovery</Link>
              </li>
              <li>
                <Link to="/books">2. Book Catalog & Listings</Link>
              </li>
              <li>
                <Link to="/exchange">3. Borrow / Lend / Trade</Link>
              </li>
              <li>
                <Link to="/dashboard">4. User Account & Shelf</Link>
              </li>
              <li>
                <Link to="/admin">5. Admin & Moderation</Link>
              </li>
            </ul>
          </div>

          {/* Technology Stack & Credits */}
          <div className="bb-footer-col">
            <h4 className="bb-footer-title">Architecture</h4>
            <ul className="bb-footer-links">
              <li>React + Vite (Frontend)</li>
              <li>Node.js + Express (Backend)</li>
              <li>MongoDB + Mongoose (Database)</li>
              <li>JWT Authentication & Role Guard</li>
              <li>Vanilla CSS with Custom Design Tokens</li>
            </ul>
          </div>

          {/* Project Guidelines */}
          <div className="bb-footer-col">
            <h4 className="bb-footer-title">Team Guidelines</h4>
            <p className="bb-footer-text">
              Built by a 5-developer engineering team. One shared foundation, modular page
              separation, and zero merge conflicts.
            </p>
            <div className="bb-footer-status-pill">
              <span className="bb-status-dot"></span> Foundation Phase Active
            </div>
          </div>
        </div>

        {/* Bottom Vintage Colophon */}
        <div className="bb-footer-bottom">
          <p>© {new Date().getFullYear()} BookBridge Project. Handcrafted with ink on parchment.</p>
          <p className="bb-footer-sub">Playfair Display & Lora • College Capstone</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
