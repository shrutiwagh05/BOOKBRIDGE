
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

  const closeMenu = () => setMobileMenuOpen(false);

  const handleLogout = async () => {
    closeMenu();
    await logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `bb-nav-link ${isActive ? 'active' : ''}`;

  return (
    <header className="bb-navbar-wrapper">
      <div className="bb-navbar-container container">
        <Link to="/" className="bb-brand" onClick={closeMenu}>
          <div className="bb-brand-emblem" aria-hidden="true">
            📚
          </div>
          <div className="bb-brand-text">
            <span className="bb-brand-title">BookBridge</span>
            <span className="bb-brand-tagline">
              Paper &amp; Ink Campus Library
            </span>
          </div>
        </Link>

        <button
          type="button"
          className="bb-mobile-toggle"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>

        <nav
          className={`bb-nav ${mobileMenuOpen ? 'is-open' : ''}`}
          aria-label="Main navigation"
        >
          <ul className="bb-nav-links">
            <li>
              <NavLink to="/" end className={navLinkClass} onClick={closeMenu}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/books" className={navLinkClass} onClick={closeMenu}>
                Browse Books
              </NavLink>
            </li>
            <li>
              <NavLink to="/exchange" className={navLinkClass} onClick={closeMenu}>
                Borrow &amp; Exchange
              </NavLink>
            </li>

            {isAuthenticated && (
              <>
                <li>
                  <NavLink to="/dashboard" className={navLinkClass} onClick={closeMenu}>
                    Dashboard
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/profile" className={navLinkClass} onClick={closeMenu}>
                    Profile
                  </NavLink>
                </li>
              </>
            )}

            {isAuthenticated && user?.role === 'admin' && (
              <li>
                <NavLink to="/admin" className={navLinkClass} onClick={closeMenu}>
                  Admin
                </NavLink>
              </li>
            )}
          </ul>

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
                  {user?.role === 'admin' && (
                    <Badge variant="terracotta" size="sm">Admin</Badge>
                  )}
                </div>

                <Button size="sm" variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            ) : (
              <div className="bb-auth-buttons">
                <Link to="/login" onClick={closeMenu}>
                  <Button size="sm" variant="outline">Sign In</Button>
                </Link>
                <Link to="/register" onClick={closeMenu}>
                  <Button size="sm" variant="primary">Join Library</Button>
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
