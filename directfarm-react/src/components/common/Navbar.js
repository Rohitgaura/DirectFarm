import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import apiService from '../../services/api'; // ✅ Import apiService
import authUtils from '../../utils/auth';
import '../../styles/Navbar.css';
import ChatModal from '../chat/ChatModal';
import { toast } from 'react-toastify';


const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // ✅ Initialize user state directly from authUtils
  const getInitialUser = () => {
    try {
      return authUtils.getUser();
    } catch (error) {
      console.error('Error loading initial user:', error);
    }
    return null;
  };

  const [user, setUser] = useState(getInitialUser);
  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Chat modal state
  const [showChat, setShowChat] = useState(false);
  const [chatPartner, setChatPartner] = useState(null);
  const [chatProduct, setChatProduct] = useState(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close profile dropdown if clicked outside
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      // Close notification dropdown if clicked outside
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      // Close mobile menu if clicked outside
      const navMenuElement = document.querySelector('.nav-menu');
      const navToggleElement = document.querySelector('.nav-toggle');
      if (menuOpen && navMenuElement && !navMenuElement.contains(event.target) &&
        navToggleElement && !navToggleElement.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, showNotifications, menuOpen]);

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


  // ✅ Load user from authUtils immediately
  useEffect(() => {
    let isMounted = true;
    let verifyTimeout = null;
    let isVerifying = false;

    const loadUser = () => {
      const auth = authUtils.getAuth();

      if (auth) {
        try {
          // ✅ Load user immediately from authUtils (no waiting)
          const userData = auth.user;

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
                  authUtils.clearAuth();
                  setUser(null);
                }
              } catch (error) {
                // Only clear on auth errors (401, 403), not on network errors
                if (error.status === 401 || error.status === 403) {
                  if (isMounted) {
                    authUtils.clearAuth();
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
            authUtils.clearAuth();
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
    const auth = authUtils.getAuth();

    console.log('🔄 Navbar: After navigation - auth exists:', !!auth);

    // Always check authUtils and sync with state
    if (auth) {
      try {
        const userData = auth.user;
        // Always update state from authUtils after navigation
        console.log('✅ Navbar: Syncing user state from authUtils after navigation');
        setUser(userData);
      } catch (error) {
        console.error('❌ Navbar: Error parsing user after navigation:', error);
      }
    } else {
      console.log('ℹ️ Navbar: No auth found, clearing user state');
      setUser(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]); // Only re-run when location changes, not when user changes

  // ✅ Menu toggle controls for mobile navigation
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  // ✅ Toggle controls for profile and notifications dropdowns
  const toggleProfile = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setShowNotifications(false); // Close notifications if opening profile
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) setIsOpen(false); // Close profile if opening notifications
  };

  // ✅ Smooth scroll to sections (Home page)
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleNavigation = (path, sectionId) => {
    console.log('🔵 handleNavigation called:', { path, sectionId });
    closeMenu(); // Close mobile menu
    if (sectionId) {
      console.log('📍 Scrolling to section:', sectionId);
      if (location.pathname === '/') {
        scrollToSection(sectionId);
      } else {
        navigate('/');
        setTimeout(() => scrollToSection(sectionId), 100);
      }
    } else {
      console.log('🚀 Navigating to:', path);
      navigate(path);
    }
  };

  // ✅ Logout handler
  const handleLogout = () => {
    authUtils.clearAuth();
    setUser(null);
    window.dispatchEvent(new Event('userChanged')); // Notify components
    navigate('/');
  };

  // ✅ Handle Link Click (Programmatic Navigation)
  const handleLinkClick = (path) => {
    console.log(`🖱️ Navbar: Navigating to ${path}`);
    setIsOpen(false);
    navigate(path);
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
        <div className="nav-logo" onClick={() => handleNavigation('/')} style={{ cursor: 'pointer' }}>
          <i className="fas fa-seedling"></i>
          <span>DirectFarm</span>
        </div>

        {/* Menu */}
        <ul className={`nav-menu ${menuOpen ? 'active' : ''}`}>
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
                <button
                  onClick={() => handleNavigation(item.path, item.sectionId)}
                  className={`nav-link-btn ${location.pathname === item.path ? 'active' : ''}`}
                >
                  {item.label}
                </button>
              )}
            </li>
          ))}
        </ul>

        {/* Auth Buttons / User Info */}
        <div className="nav-auth">
          {user && (user.name || user.email) ? (
            <div className="nav-profile-container">
              {/* Notification Bell */}
              <div
                className="notification-container"
                ref={notificationRef}
                style={{ position: 'relative', marginRight: '20px', cursor: 'pointer' }}
              >
                <div className="notification-bell" onClick={toggleNotifications}>
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
                      notifications.slice(0, 4).map(notification => (
                        <div
                          key={notification._id}
                          className={`notification-item ${!notification.read ? 'unread' : ''}`}
                          style={{
                            padding: '12px',
                            borderBottom: '1px solid #eee',
                            backgroundColor: notification.read ? 'white' : '#f0f7ff',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '5px'
                          }}
                          onClick={() => {
                            markAsRead(notification._id);

                            // Handle chat notifications
                            if (notification.type === 'chat') {
                              // Check if metadata exists
                              if (notification.metadata && notification.metadata.senderId) {
                                const senderInfo = notification.metadata;
                                setChatPartner({
                                  id: senderInfo.senderId,
                                  name: senderInfo.senderName
                                });
                                if (senderInfo.productId) {
                                  setChatProduct({
                                    id: senderInfo.productId,
                                    vegetableType: senderInfo.productName
                                  });
                                } else {
                                  setChatProduct(null);
                                }
                                setShowChat(true);
                                setShowNotifications(false);
                              } else {
                                console.error('Chat notification missing metadata:', notification);
                                toast.error('Unable to open chat - notification data incomplete');
                              }
                            }
                            // Handle negotiation notifications
                            else if (notification.type === 'negotiation' || notification.type === 'negotiation_update') {
                              if (user.role === 'farmer' && notification.type === 'negotiation') {
                                navigate(`/negotiation/${notification.relatedId}`);
                              } else if (user.role === 'buyer') {
                                navigate('/negotiations');
                              }
                            }
                          }}

                        >
                          <p style={{ margin: '0', fontSize: '0.9rem' }}>{notification.message}</p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', color: '#888' }}>
                              {new Date(notification.createdAt).toLocaleDateString()}
                            </span>
                            {notification.type === 'negotiation_update' &&
                              notification.metadata?.status === 'accepted' &&
                              user.role === 'buyer' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification._id);

                                    const cartItem = {
                                      productId: notification.metadata.productId,
                                      vegetableType: notification.metadata.productName,
                                      quantity: notification.metadata.quantity,
                                      totalPrice: (notification.metadata.price * notification.metadata.quantity).toFixed(2),
                                      pricePerKg: notification.metadata.price
                                    };

                                    localStorage.setItem('cart', JSON.stringify([cartItem]));
                                    setShowNotifications(false);
                                    navigate('/checkout');
                                  }}
                                  style={{
                                    padding: '4px 12px',
                                    backgroundColor: '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem',
                                    fontWeight: 'bold'
                                  }}
                                >
                                  Pay Now
                                </button>
                              )}
                          </div>
                        </div>
                      ))
                    )}
                    {notifications.length > 4 && (
                      <div
                        onClick={() => {
                          setShowNotifications(false);
                          navigate('/notifications');
                        }}
                        style={{
                          padding: '12px',
                          textAlign: 'center',
                          color: '#667eea',
                          fontWeight: '600',
                          cursor: 'pointer',
                          borderTop: '1px solid #eee',
                          background: '#f8f9fa'
                        }}
                      >
                        View All Notifications
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="profile-wrapper" ref={profileRef} style={{ position: 'relative' }}>
                <div className="profile-trigger" onClick={toggleProfile}>
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
                    <div className="dropdown-divider"></div>
                    <div
                      className="dropdown-item"
                      onClick={() => handleLinkClick('/profile')}
                    >
                      <i className="fas fa-user"></i>
                      <span>Profile</span>
                    </div>

                    <div
                      className="dropdown-item"
                      onClick={() => handleLinkClick('/messages')}
                    >
                      <i className="fas fa-comments"></i>
                      <span>Messages</span>
                    </div>

                    {user.role === 'buyer' && (
                      <div
                        className="dropdown-item"
                        onClick={() => handleLinkClick('/cart')}
                      >
                        <i className="fas fa-shopping-cart"></i>
                        My Cart
                      </div>
                    )}
                    {user.role === 'buyer' ? (
                      <>
                        <div
                          className="dropdown-item"
                          onClick={() => handleLinkClick('/buyer-dashboard')}
                        >
                          <i className="fas fa-tachometer-alt"></i>
                          Dashboard
                        </div>
                        <div
                          className="dropdown-item"
                          onClick={() => handleLinkClick('/buyer-analytics')}
                        >
                          <i className="fas fa-chart-pie"></i>
                          Analytics
                        </div>
                        <div
                          className="dropdown-item"
                          onClick={() => handleLinkClick('/orders')}
                        >
                          <i className="fas fa-box"></i>
                          My Orders
                        </div>
                        <div
                          className="dropdown-item"
                          onClick={() => handleLinkClick('/negotiations')}
                        >
                          <i className="fas fa-handshake"></i>
                          Negotiations
                        </div>
                      </>
                    ) : user.role === 'farmer' ? (
                      <>
                        <div
                          className="dropdown-item"
                          onClick={() => handleLinkClick('/farmer-dashboard')}
                        >
                          <i className="fas fa-tachometer-alt"></i>
                          Dashboard
                        </div>
                        <div
                          className="dropdown-item"
                          onClick={() => handleLinkClick('/farmer-analytics')}
                        >
                          <i className="fas fa-chart-line"></i>
                          Analytics
                        </div>
                        <div
                          className="dropdown-item"
                          onClick={() => handleLinkClick('/crops-history')}
                        >
                          <i className="fas fa-seedling"></i>
                          My Crops
                        </div>
                      </>
                    ) : user.role === 'admin' ? (
                      <div
                        className="dropdown-item"
                        onClick={() => handleLinkClick('/admin-dashboard')}
                      >
                        <i className="fas fa-tachometer-alt"></i>
                        Admin Dashboard
                      </div>
                    ) : null}
                    <div className="dropdown-divider"></div>
                    <button
                      className="dropdown-item logout-item"
                      onClick={(e) => {
                        console.log('🖱️ Navbar: Clicked Logout');
                        handleLogout();
                      }}
                    >
                      <i className="fas fa-sign-out-alt"></i>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <button onClick={() => handleNavigation('/login')} className="nav-btn nav-btn-login">
                <i className="fas fa-sign-in-alt"></i> Login
              </button>
              <button onClick={() => handleNavigation('/register')} className="nav-btn nav-btn-register">
                <i className="fas fa-user-plus"></i> Register
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className={`nav-toggle ${menuOpen ? 'active' : ''}`} onClick={toggleMenu}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
      </div>

      {/* Chat Modal */}
      {showChat && chatPartner && (
        <ChatModal
          isOpen={showChat}
          onClose={() => {
            setShowChat(false);
            setChatPartner(null);
            setChatProduct(null);
          }}
          farmer={chatPartner}
          product={chatProduct}
          currentUser={user}
        />
      )}
    </nav>
  );
};

export default Navbar;
