import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import apiService from '../../services/api'; // ✅ Import apiService
import '../../styles/Navbar.css';

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
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    if (user) {
      try {
        const response = await apiService.getNotifications();
        if (response.success) {
          setNotifications(response.data);
          setUnreadCount(response.data.filter(n => !n.read).length);
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    }
  };

  useEffect(() => {
    // Only load notifications if user is logged in
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // Load immediately
    loadNotifications();

    // Set up polling interval (60 seconds to reduce server load)
    const interval = setInterval(loadNotifications, 60000); // Poll every 60s

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // Only re-run when user ID changes, not on every user object change

  const markAsRead = async (id) => {
    try {
      await apiService.markNotificationRead(id);
      loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Load user from localStorage immediately
  useEffect(() => {
    let isMounted = true;
    let verifyTimeout = null;
    let isVerifying = false;

    const loadUser = () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      if (storedUser && token) {
        try {
          // ✅ Load user immediately from localStorage (no waiting)
          const userData = JSON.parse(storedUser);

          // Set user state immediately
          if (isMounted) {
            setUser(userData);
          }

          // ✅ Verify token in background (debounced, prevent duplicate requests)
          if (!isVerifying) {
            clearTimeout(verifyTimeout);
            verifyTimeout = setTimeout(async () => {
              isVerifying = true;
              try {
                const result = await apiService.verifyToken();
                if (!isMounted) return;

                if (result && result.valid === false) {
                  localStorage.removeItem('user');
                  localStorage.removeItem('token');
                  setUser(null);
                }
              } catch (error) {
                // Only clear on auth errors (401, 403), not on network errors
                if (error.status === 401 || error.status === 403) {
                  if (isMounted) {
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                    setUser(null);
                  }
                }
              } finally {
                isVerifying = false;
              }
            }, 1000); // Debounce verification by 1 second
          }
        } catch (error) {
          console.error('❌ Navbar: Error parsing user data:', error);
          if (isMounted) {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            setUser(null);
          }
        }
      } else {
        console.log('ℹ️ Navbar: No user or token found, setting user to null');
        setUser(null);
      }
    };

    // Load user immediately on mount
    loadUser();

    // ✅ Sync across tabs & components - reload on storage change (debounced)
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === null) {
        clearTimeout(verifyTimeout);
        verifyTimeout = setTimeout(loadUser, 300);
      }
    };

    // ✅ Handle custom userChanged event (same tab) - debounced to prevent rapid calls
    const handleUserChanged = () => {
      clearTimeout(verifyTimeout);
      verifyTimeout = setTimeout(loadUser, 300);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userChanged', handleUserChanged);

    // Also listen for focus event (when user returns to tab) - debounced
    const handleFocus = () => {
      clearTimeout(verifyTimeout);
      verifyTimeout = setTimeout(loadUser, 500);
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      isMounted = false;
      clearTimeout(verifyTimeout);
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
    { path: '/social-impact', label: 'Social Impact' }
  );

  // Add Career link only for non-logged-in users
  if (!user) {
    navItems.push({ path: '/career', label: 'Careers' });
  }

  navItems.push(
    { path: '/help', label: 'Help' }
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

        {/* Auth Buttons / User Info */}
        <div className="nav-auth">
          {user && (user.name || user.email) ? (
            <div className="nav-profile-container">
              {/* Notification Bell */}
              <div className="notification-container" style={{ position: 'relative', marginRight: '20px', cursor: 'pointer' }}>
                <div className="notification-bell" onClick={() => setShowNotifications(!showNotifications)}>
                  <i className="fas fa-bell" style={{ fontSize: '1.2rem', color: '#333' }}></i>
                  {unreadCount > 0 && (
                    <span className="notification-badge" style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      backgroundColor: '#ff4444',
                      color: 'white',
                      borderRadius: '50%',
                      padding: '2px 6px',
                      fontSize: '0.7rem',
                      fontWeight: 'bold'
                    }}>
                      {unreadCount}
                    </span>
                  )}
                </div>

                {showNotifications && (
                  <div className="notification-dropdown" style={{
                    position: 'absolute',
                    top: '40px',
                    right: '0',
                    width: '300px',
                    backgroundColor: 'white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    borderRadius: '8px',
                    zIndex: 1000,
                    maxHeight: '400px',
                    overflowY: 'auto'
                  }}>
                    <div className="notification-header" style={{ padding: '12px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>
                      Notifications
                    </div>
                    {notifications.length === 0 ? (
                      <div className="no-notifications" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                        No notifications
                      </div>
                    ) : (
                      notifications.map(notification => (
                        <div
                          key={notification._id}
                          className={`notification-item ${!notification.read ? 'unread' : ''}`}
                          style={{
                            padding: '12px',
                            borderBottom: '1px solid #eee',
                            backgroundColor: notification.read ? 'white' : '#f0f7ff',
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            markAsRead(notification._id);
                            if (notification.type === 'negotiation' || notification.type === 'negotiation_update') {
                              if (user.role === 'farmer' && notification.type === 'negotiation') {
                                navigate(`/negotiation/${notification.relatedId}`);
                              } else if (user.role === 'buyer') {
                                navigate('/negotiations');
                              }
                            }
                          }}
                        >
                          <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem' }}>{notification.message}</p>
                          <span style={{ fontSize: '0.75rem', color: '#888' }}>
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div className="profile-trigger" onClick={() => setIsOpen(!isOpen)}>
                <div className="profile-avatar">
                  {(user.name || user.email).charAt(0).toUpperCase()}
                </div>
                <div className="profile-info-text">
                  <span className="profile-name">{user.name || user.email}</span>
                  <span className="profile-role">{user.role || 'User'}</span>
                </div>
                <div className={`profile-hamburger ${isOpen ? 'active' : ''}`}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>

              {isOpen && (
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-avatar">
                      {(user.name || user.email).charAt(0).toUpperCase()}
                    </div>
                    <div className="dropdown-user-details">
                      <strong>{user.name || user.email}</strong>
                      <span>{user.role || 'User'}</span>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <Link to="/profile" className="dropdown-item" onClick={() => setIsOpen(false)}>
                    <i className="fas fa-user-circle"></i>
                    Personal Profile
                  </Link>
                  {user.role === 'buyer' && (
                    <Link to="/cart" className="dropdown-item" onClick={() => setIsOpen(false)}>
                      <i className="fas fa-shopping-cart"></i>
                      My Cart
                    </Link>
                  )}
                  {user.role === 'buyer' ? (
                    <>
                      <Link to="/orders" className="dropdown-item" onClick={() => setIsOpen(false)}>
                        <i className="fas fa-shopping-bag"></i>
                        Order History
                      </Link>
                      <Link to="/negotiations" className="dropdown-item" onClick={() => setIsOpen(false)}>
                        <i className="fas fa-handshake"></i>
                        Negotiation History
                      </Link>
                    </>
                  ) : user.role === 'farmer' ? (
                    <Link to="/crops-history" className="dropdown-item" onClick={() => setIsOpen(false)}>
                      <i className="fas fa-history"></i>
                      Crops Upload History
                    </Link>
                  ) : null}
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item logout-item" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt"></i>
                    Logout
                  </button>
                </div>
              )}
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
    </nav>
  );
};

export default Navbar;
