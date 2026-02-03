
import React from 'react';
import { NavLink } from 'react-router-dom';

const NavBar = () => {
  return (
    <nav data-test-id="auth-mfe-navbar-root">
      <ul>
        <li>
          <NavLink
            to="/"
            className="btn-secondary"
            style={({ isActive }) => ({
              backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-secondary)',
            })}
            data-test-id="auth-mfe-navbar-home-link"
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/about"
            className="btn-secondary"
            style={({ isActive }) => ({
              backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-secondary)',
            })}
            data-test-id="auth-mfe-navbar-about-link"
          >
            About
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
