import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // Simple scroll function
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleNavigation = (path, sectionId) => {
    closeMenu();

    if (sectionId) {
      if (location.pathname === '/') {
        scrollToSection(sectionId);
      } else {
        navigate('/');
        setTimeout(() => {
          scrollToSection(sectionId);
        }, 100);
      }
    } else {
      navigate(path);
    }
  };

  const navItems = [
    { path: '/', label: 'Home', sectionId: 'home' },
    { path: '/about', label: 'About Us', sectionId: null },
    { path: '/social-impact', label: 'Social Impact', sectionId: null }
  ];

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={closeMenu}>
          <i className="fas fa-seedling"></i>
          <span>DirectFarm</span>
        </Link>

        <ul className={`nav-menu ${isOpen ? 'active' : ''}`}>
          {navItems.map((item) => (
            <li key={item.label}>
              {item.sectionId ? (
                <button 
                  onClick={() => handleNavigation(item.path, item.sectionId)}
                  className="nav-link-btn"
                >
                  {item.label}
                </button>
              ) : (
                <Link 
                  to={item.path} 
                  onClick={closeMenu}
                  className={location.pathname === item.path ? 'active' : ''}
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        <div className="nav-auth">
          <Link to="/login" className="nav-btn nav-btn-login">
            <i className="fas fa-sign-in-alt"></i>
            Login
          </Link>
          <Link to="/register" className="nav-btn nav-btn-register">
            <i className="fas fa-user-plus"></i>
            Register
          </Link>
        </div>

        <div className="nav-toggle" onClick={toggleMenu}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
