import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from './Button';
import Badge from './Badge';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="bb-navbar-wrapper">
      <div className="bb-navbar-container container">
        {/* Brand Logo */}
        <Link to="/" className="bb-brand" onClick={closeMenu}>
          <div className="bb-brand-emblem">📖</div>
          <div className="bb-brand-text">
            <span className="bb-brand-title">BookBridge</span>
            <span className="bb-brand-tagline">Paper & Ink Campus Library</span>
          </div>
        </Link>

        {/* Mobile Menu Toggle Button */}
        <button
          className="bb-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>

        {/* Navigation Links (Module 1 - 5 access) */}
        <nav className={`bb-nav ${mobileMenuOpen ? 'is-open' : ''}`}>
          <ul className="bb-nav-links">
            <li>
              <NavLink
                to="/"
                end
                className={({ isActive }) => `bb-nav-link ${isActive ? 'active' : ''}`}
                onClick={closeMenu}
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/books"
                className={({ isActive }) => `bb-nav-link ${isActive ? 'active' : ''}`}
                onClick={closeMenu}
              >
                Browse Books
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/exchange"
                className={({ isActive }) => `bb-nav-link ${isActive ? 'active' : ''}`}
                onClick={closeMenu}
              >
                Borrow & Exchange
              </NavLink>
            </li>
            {isAuthenticated && (
              <li>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) => `bb-nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  Dashboard
                </NavLink>
              </li>
            )}
            <li>
              <NavLink
                to="/admin"
                className={({ isActive }) => `bb-nav-link ${isActive ? 'active' : ''}`}
                onClick={closeMenu}
              >
                Admin
              </NavLink>
            </li>
          </ul>

          {/* User Auth Section */}
          <div className="bb-nav-actions">
            {isAuthenticated ? (
              <div className="bb-user-menu">
                <Link to="/books/add" onClick={closeMenu}>
                  <Button size="sm" variant="primary">
                    + List a Book
                  </Button>
                </Link>
                <div className="bb-user-info">
                  <span className="bb-user-name">{user?.name || 'Student'}</span>
                  {user?.role === 'admin' && <Badge variant="terracotta" size="sm">Admin</Badge>}
                </div>
                <Button size="sm" variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            ) : (
              <div className="bb-auth-buttons">
                <Link to="/login" onClick={closeMenu}>
                  <Button size="sm" variant="outline">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" onClick={closeMenu}>
                  <Button size="sm" variant="primary">
                    Join Library
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
