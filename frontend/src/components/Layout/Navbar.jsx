import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.scss';

export default function Navbar() {
  const location = useLocation();
  const isAttempt = location.pathname.startsWith('/assignment/');

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        {/* Brand */}
        <Link to="/" className="navbar__brand">
          <span className="navbar__brand-icon" aria-hidden="true">⬡</span>
          <span className="navbar__brand-text">
            Cipher<span className="navbar__brand-accent">SQL</span>Studio
          </span>
        </Link>

        {/* Navigation links */}
        <div className="navbar__links">
          <Link
            to="/"
            className={`navbar__link ${!isAttempt ? 'navbar__link--active' : ''}`}
          >
            Assignments
          </Link>
        </div>

        {/* Status indicator */}
        <div className="navbar__status">
          <span className="navbar__dot" aria-label="Connected" />
          <span className="navbar__status-text">LIVE</span>
        </div>
      </div>
    </nav>
  );
}