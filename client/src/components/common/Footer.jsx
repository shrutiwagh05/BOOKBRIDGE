
import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="bb-footer-wrapper">
      <div className="bb-footer-container container">
        <div className="bb-footer-grid">
          <div className="bb-footer-brand-col">
            <div className="bb-footer-brand">
              <span className="bb-footer-icon">📚</span>
              <span className="bb-footer-name">BookBridge</span>
            </div>

            <p className="bb-footer-about">
              Your campus book community. Buy, sell, borrow, lend,
              and exchange books in one convenient place.
            </p>

            <div className="bb-footer-tag">
              <span>Connecting Readers, One Book at a Time</span>
            </div>
          </div>

          <div className="bb-footer-col">
            <h4 className="bb-footer-title">Explore</h4>
            <ul className="bb-footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/books">Browse Books</Link></li>
              <li><Link to="/books/add">List a Book</Link></li>
              <li><Link to="/exchange">Borrow &amp; Exchange</Link></li>
            </ul>
          </div>

          <div className="bb-footer-col">
            <h4 className="bb-footer-title">Your Account</h4>
            <ul className="bb-footer-links">
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/my-listings">My Listings</Link></li>
              <li><Link to="/requests">My Requests</Link></li>
              <li><Link to="/notifications">Notifications</Link></li>
            </ul>
          </div>

          <div className="bb-footer-col">
            <h4 className="bb-footer-title">About BookBridge</h4>
            <p className="bb-footer-text">
              A student-focused marketplace designed to make
              educational resources more accessible and affordable.
            </p>
            <ul className="bb-footer-links">
              <li>React &amp; Vite</li>
              <li>Node.js &amp; Express</li>
              <li>MongoDB</li>
            </ul>
          </div>
        </div>

        <div className="bb-footer-bottom">
          <p>
            © {new Date().getFullYear()} BookBridge. All rights reserved.
          </p>
          <p className="bb-footer-sub">
            Made for readers. Built for campus communities.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
