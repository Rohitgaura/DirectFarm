import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  // Load user from localStorage on component mount
  // useEffect(() => {
  //   const storedUser = localStorage.getItem('user');
  //   if (storedUser) {
  //     setUser(JSON.parse(storedUser));
  //   }
  // }, []);
  useEffect(() => {
    // Load user from localStorage on component mount
    const loadUser = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Error parsing user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    // Load user immediately
    loadUser();
  
    // Listen for storage changes
    const handleStorageChange = () => {
      loadUser();
    };
  
    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for same-tab updates
    window.addEventListener('userChanged', handleStorageChange);
  
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userChanged', handleStorageChange);
    };
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // Scroll to a section by ID
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleNavigation = (path, sectionId) => {
    closeMenu();

    if (sectionId) {
      if (location.pathname === '/') {
        scrollToSection(sectionId);
      } else {
        navigate('/');
        setTimeout(() => scrollToSection(sectionId), 100);
      }
    } else {
      navigate(path);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    // Dispatch event to notify other components
    window.dispatchEvent(new Event('userChanged'));
    navigate('/');
  };

  const navItems = [
    { path: '/', label: 'Home', sectionId: 'home' },
  ];
  
  // Add farmer dashboard link if user is a farmer (insert after Home)
  if (user && user.role === 'farmer') {
    navItems.push({ path: '/farmer-dashboard', label: 'Dashboard', sectionId: null });
  }
  
  // Add remaining navigation items
  navItems.push(
    { path: '/about', label: 'About Us', sectionId: null },
    { path: '/social-impact', label: 'Social Impact', sectionId: null }
  );

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
  {user ? (
    <div className="nav-user-container">
      <div className="nav-user-info">
        <i className="fas fa-user nav-user-icon"></i>
        <div className="nav-user-text">
          <span className="nav-user-name">{user.name}</span>
          <span className="nav-user-role">{user.role}</span>
        </div>
      </div>
      <button className="nav-btn nav-btn-logout" onClick={handleLogout}>Logout</button>
    </div>
  ) : (
    <>
      <Link to="/login" className="nav-btn nav-btn-login">
        <i className="fas fa-sign-in-alt"></i> Login
      </Link>
      <Link to="/register" className="nav-btn nav-btn-register">
        <i className="fas fa-user-plus"></i> Register
      </Link>
    </>
  )}
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
