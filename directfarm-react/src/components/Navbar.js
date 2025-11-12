import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import HelpFeedback from './HelpFeedback';
import apiService from '../services/api'; // ✅ Import apiService
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // ✅ Initialize user state directly from localStorage
  const getInitialUser = () => {
    try {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (storedUser && token) {
        return JSON.parse(storedUser);
      }
    } catch (error) {
      console.error('Error loading initial user:', error);
    }
    return null;
  };
  
  const [user, setUser] = useState(getInitialUser);
  const [showHelpFeedback, setShowHelpFeedback] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Load user from localStorage immediately
  useEffect(() => {
    const loadUser = () => {
      console.log('🔄 Navbar: Loading user from localStorage...');
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
  
      console.log('🔄 Navbar: storedUser exists:', !!storedUser);
      console.log('🔄 Navbar: token exists:', !!token);
  
      if (storedUser && token) {
        try {
          // ✅ Load user immediately from localStorage (no waiting)
          const userData = JSON.parse(storedUser);
          console.log('✅ Navbar: User data parsed:', userData);
          console.log('✅ Navbar: User name:', userData.name);
          console.log('✅ Navbar: User role:', userData.role);
          
          // Set user state immediately
          setUser(userData);
          console.log('✅ Navbar: User state set');
          
          // ✅ Optional: Verify token in background (non-blocking, won't affect UI)
          // Only verify if the endpoint exists and works
          apiService.verifyToken().then(result => {
            if (result && result.valid === false) {
              // Only clear if token is explicitly invalid
              console.warn('⚠️ Navbar: Token verification failed, clearing user');
              localStorage.removeItem('user');
              localStorage.removeItem('token');
              setUser(null);
            } else {
              console.log('✅ Navbar: Token verified successfully');
            }
          }).catch(error => {
            // Ignore verification errors - don't clear user on network/API errors
            console.log('ℹ️ Navbar: Token verification skipped (non-critical):', error.message);
          });
        } catch (error) {
          console.error('❌ Navbar: Error parsing user data:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setUser(null);
        }
      } else {
        console.log('ℹ️ Navbar: No user or token found, setting user to null');
        setUser(null);
      }
    };
  
    // Load user immediately on mount
    loadUser();
  
    // ✅ Sync across tabs & components - reload immediately on storage change
    const handleStorageChange = (e) => {
      console.log('🔄 Navbar: Storage event detected:', e.key);
      if (e.key === 'user' || e.key === null) {
        loadUser();
      }
    };
    
    // ✅ Handle custom userChanged event (same tab) - fires immediately after login
    const handleUserChanged = (e) => {
      console.log('🔄 Navbar: userChanged event received');
      // Load user immediately - localStorage is synchronous
      loadUser();
      // Also check again after a tiny delay to ensure state update
      setTimeout(() => {
        loadUser();
      }, 10);
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userChanged', handleUserChanged);
  
    // Also listen for focus event (when user returns to tab)
    const handleFocus = () => {
      console.log('🔄 Navbar: Window focused, reloading user');
      loadUser();
    };
    window.addEventListener('focus', handleFocus);
  
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userChanged', handleUserChanged);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // ✅ Re-check user state when location changes (after navigation)
  useEffect(() => {
    console.log('🔄 Navbar: Location changed to:', location.pathname);
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    console.log('🔄 Navbar: After navigation - storedUser exists:', !!storedUser);
    console.log('🔄 Navbar: After navigation - current user state:', !!user);
    
    // Always check localStorage and sync with state
    if (storedUser && token) {
      try {
        const userData = JSON.parse(storedUser);
        // Always update state from localStorage after navigation
        console.log('✅ Navbar: Syncing user state from localStorage after navigation');
        setUser(userData);
      } catch (error) {
        console.error('❌ Navbar: Error parsing user after navigation:', error);
      }
    } else if (!storedUser && user) {
      console.log('ℹ️ Navbar: User removed from localStorage, clearing state');
      setUser(null);
    }
  }, [location.pathname]);

  // ✅ Menu toggle controls
  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // ✅ Smooth scroll to sections (Home page)
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

  // ✅ Logout handler
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    window.dispatchEvent(new Event('userChanged')); // Notify components
    navigate('/');
  };

  // ✅ Navigation Items
  const navItems = [
    { path: '/', label: 'Home', sectionId: 'home' },
  ];
  
  if (user?.role === 'farmer') {
    navItems.push({ path: '/farmer-dashboard', label: 'Dashboard' });
  } else if (user?.role === 'buyer') {
    navItems.push({ path: '/buyer-dashboard', label: 'Browse Products' });
  }
  
  navItems.push(
    { path: '/about', label: 'About Us' },
    { path: '/social-impact', label: 'Social Impact' },
    { path: '#', label: 'Help', isModal: true }
  );

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo */}
        <Link to="/" className="nav-logo" onClick={closeMenu}>
          <i className="fas fa-seedling"></i>
          <span>DirectFarm</span>
        </Link>

        {/* Menu */}
        <ul className={`nav-menu ${isOpen ? 'active' : ''}`}>
          {navItems.map((item) => (
            <li key={item.label}>
              {item.isModal ? (
                <button
                  onClick={() => {
                    setShowHelpFeedback(true);
                    closeMenu();
                  }}
                  className="nav-link-btn"
                >
                  {item.label}
                </button>
              ) : item.sectionId ? (
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

        {/* Auth Buttons / User Info */}
        <div className="nav-auth">
          {user && (user.name || user.email) ? (
            <div className="nav-user-container">
              <div className="nav-user-info">
                <i className="fas fa-user nav-user-icon"></i>
                <div className="nav-user-text">
                  <span className="nav-user-name">{user.name || user.email || 'User'}</span>
                  <span className="nav-user-role">{user.role || 'user'}</span>
                </div>
              </div>
              <button className="nav-btn nav-btn-logout" onClick={handleLogout}>
                Logout
              </button>
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

        {/* Mobile Menu Toggle */}
        <div className="nav-toggle" onClick={toggleMenu}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
      </div>
      
      {/* Help & Feedback Modal */}
      <HelpFeedback 
        isOpen={showHelpFeedback} 
        onClose={() => setShowHelpFeedback(false)} 
      />
    </nav>
  );
};

export default Navbar;
