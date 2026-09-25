import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import apiService from '../../services/api'; // ✅ Import apiService
import socketService from '../../services/socket'; // ✅ Import socketService
import syncManager from '../../services/sync'; // ✅ Import syncManager
import authUtils from '../../utils/auth';
import '../../styles/Navbar.css';
import ChatModal from '../chat/ChatModal';
// toast removed as it is unused


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
  const [notifFilter, setNotifFilter] = useState('unread_first'); // 'all', 'unread_first', 'unread'

  // Chat modal state
  const [showChat, setShowChat] = useState(false);
  const [chatPartner, setChatPartner] = useState(null);
  const [chatProduct, setChatProduct] = useState(null);

  const displayedNotifications = React.useMemo(() => {
    let list = [...notifications];
    if (notifFilter === 'unread') {
      list = list.filter(n => !n.read);
    } else if (notifFilter === 'unread_first') {
      list.sort((a, b) => {
        if (!a.read && b.read) return -1;
        if (a.read && !b.read) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    }
    return list;
  }, [notifications, notifFilter]);

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

  // Stabilize user ID to prevent unnecessary re-renders
  const userId = user?._id || user?.id;

  const loadNotifications = useCallback(async () => {
    if (userId) {
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
  }, [userId]);

  useEffect(() => {
    // Only load notifications if user is logged in
    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // Load immediately
    loadNotifications();

    // Set up polling interval (60 seconds to reduce server load)
    const interval = setInterval(loadNotifications, 60000); // Poll every 60s

    return () => clearInterval(interval);
  }, [userId, loadNotifications]);

  // eslint-disable-next-line no-unused-vars
  const markAsRead = async (id) => {
    try {
      await apiService.markNotificationRead(id);
      loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };


  // ✅ Initial Load & Event Listeners
  useEffect(() => {
    let isMounted = true;

    // Initialize SyncManager
    syncManager.init();

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

    // ✅ Handle custom userChanged event (same tab) - debounced to prevent rapid calls
    const handleUserChanged = () => {
      clearTimeout(verifyTimeout);
      verifyTimeout = setTimeout(loadUser, 300);
    };

    window.addEventListener('userChanged', handleUserChanged);

    // Also listen for focus event (when user returns to tab) - debounced
    const handleFocus = () => {
      clearTimeout(verifyTimeout);
      verifyTimeout = setTimeout(loadUser, 500);
    };
    window.addEventListener('focus', handleFocus);

    // ✅ Handle notification updates immediately
    const handleNotificationUpdate = () => {
      loadNotifications();
    };
    window.addEventListener('notificationUpdated', handleNotificationUpdate);

    return () => {
      isMounted = false;
      clearTimeout(verifyTimeout);
      window.removeEventListener('userChanged', handleUserChanged);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('notificationUpdated', handleNotificationUpdate);
    };
  }, [loadNotifications]);

  // ✅ Initialize socket and handle global message delivery
  useEffect(() => {
    if (user) {
      const socket = socketService.connect();
      socketService.join(user.id || user._id);

      const handleNewMessage = (message) => {
        // If message is for me, acknowledge delivery
        // Check if I am the recipient (e.g. message.recipientId or inferred)
        // The server emits 'newMessage' to the room which is usually user's room or private chat
        // In this app, we join user's ID room. So any message sent to my ID room is for me.

        const myId = user?.id || user?._id;
        const senderId = typeof message.senderId === 'object' ? (message.senderId.id || message.senderId._id) : message.senderId;

        if (String(senderId) !== String(myId)) {
          socket.emit('messageDelivered', {
            messageId: message.id || message._id,
            senderId: senderId,
            roomId: message.roomId
          });
        }
      };

      socket.on('newMessage', handleNewMessage);

      return () => {
        socket.off('newMessage', handleNewMessage);
      };
    }
  }, [user]);

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
        loadNotifications(); // Reload fresh notification read statuses on route change
      } catch (error) {
        console.error('❌ Navbar: Error parsing user after navigation:', error);
      }
    } else {
      console.log('ℹ️ Navbar: No auth found, clearing user state');
      setUser(null);
      setNotifications([]);
      setUnreadCount(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]); // ✅ Run only on navigation change

  const handleMarkAllRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      await apiService.markAllNotificationsRead();
      loadNotifications();
    } catch (err) {
      console.error('Error marking all notifications read:', err);
    }
  };

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

  // ✅ Ripple Effect
  const createRipple = (event) => {
    const container = event.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(container.clientWidth, container.clientHeight);
    const radius = diameter / 2;

    const rect = container.getBoundingClientRect();

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - rect.left - radius}px`;
    circle.style.top = `${event.clientY - rect.top - radius}px`;
    circle.classList.add("ripple");

    const existingRipple = container.getElementsByClassName("ripple")[0];
    if (existingRipple) {
      existingRipple.remove(); // Remove existing to prevent buildup, or allow multiple
    }

    container.appendChild(circle);

    // Remove ripple after animation
    setTimeout(() => {
      circle.remove();
    }, 600);
  };

  return (
    <nav className="navbar" onClick={createRipple}>
      <div className="nav-container">
        {/* Logo */}
        <div className="nav-logo" onClick={(e) => { e.stopPropagation(); handleNavigation('/'); }} style={{ cursor: 'pointer' }}>
          <i className="fas fa-seedling"></i>
          <span>DirectFarm</span>
        </div>

        {/* Menu */}
        <ul className={`nav-menu ${menuOpen ? 'active' : ''}`}>
          {navItems.map((item) => (
            <li key={item.label}>
              {item.sectionId ? (
                <button
                  onClick={(e) => { e.stopPropagation(); handleNavigation(item.path, item.sectionId); }}
                  className="nav-link-btn"
                >
                  {item.label}
                </button>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); handleNavigation(item.path, item.sectionId); }}
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
                <div className="notification-bell" onClick={(e) => { e.stopPropagation(); toggleNotifications(); }}>
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
                    width: '320px',
                    backgroundColor: 'white',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    borderRadius: '12px',
                    zIndex: 1000,
                    maxHeight: '420px',
                    overflowY: 'auto',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div className="notification-header" style={{
                      padding: '12px 14px',
                      borderBottom: '1px solid #e2e8f0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: '#f8fafc'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: '700', fontSize: '0.92rem', color: '#0f172a' }}>Notifications</span>
                        {unreadCount > 0 ? (
                          <span style={{ background: '#ef4444', color: 'white', fontSize: '0.72rem', padding: '1px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
                            {unreadCount} new
                          </span>
                        ) : (
                          <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: '600' }}>
                            ✓ All read
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAllRead();
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#10b981',
                            fontSize: '0.78rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    {/* Filter toolbar */}
                    {notifications.length > 0 && (
                      <div style={{
                        display: 'flex',
                        gap: '4px',
                        padding: '6px 10px',
                        background: '#f1f5f9',
                        borderBottom: '1px solid #e2e8f0',
                        fontSize: '0.78rem'
                      }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); setNotifFilter('unread_first'); }}
                          style={{
                            flex: 1,
                            padding: '4px 6px',
                            borderRadius: '6px',
                            border: 'none',
                            background: notifFilter === 'unread_first' ? '#10b981' : '#ffffff',
                            color: notifFilter === 'unread_first' ? '#ffffff' : '#475569',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          🔝 Unread First
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setNotifFilter('all'); }}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: 'none',
                            background: notifFilter === 'all' ? '#10b981' : '#ffffff',
                            color: notifFilter === 'all' ? '#ffffff' : '#475569',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          All ({notifications.length})
                        </button>
                        {unreadCount > 0 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setNotifFilter('unread'); }}
                            style={{
                              padding: '4px 8px',
                              borderRadius: '6px',
                              border: 'none',
                              background: notifFilter === 'unread' ? '#ef4444' : '#ffffff',
                              color: notifFilter === 'unread' ? '#ffffff' : '#ef4444',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            Unread ({unreadCount})
                          </button>
                        )}
                      </div>
                    )}

                    {displayedNotifications.length === 0 ? (
                      <div className="no-notifications" style={{ padding: '24px 16px', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                        <i className="fas fa-bell-slash" style={{ fontSize: '1.5rem', color: '#cbd5e1', marginBottom: '8px', display: 'block' }}></i>
                        {notifFilter === 'unread' ? 'No unread notifications' : 'No notifications'}
                      </div>
                    ) : (
                      displayedNotifications.slice(0, 6).map(notification => (
                        <div
                          key={notification.id || notification._id}
                          className={`notification-item ${!notification.read ? 'unread' : 'read'}`}
                          style={{
                            padding: '12px 14px',
                            borderBottom: '1px solid #f1f5f9',
                            backgroundColor: notification.read ? '#ffffff' : '#f0f9ff',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            transition: 'background-color 0.15s ease'
                          }}
                          onClick={() => {
                            const notifId = notification.id || notification._id;
                            const productId = notification.metadata?.productId || (notification.relatedId && notification.relatedId.productId);

                            setShowNotifications(false);

                            const currentUser = authUtils.getUser() || user;
                            const userRole = currentUser?.role;

                            if (productId && userRole === 'farmer') {
                              setNotifications(prev => prev.map(n => {
                                const nPid = n.metadata?.productId || (n.relatedId && n.relatedId.productId);
                                if (String(nPid) === String(productId)) return { ...n, read: true };
                                return n;
                              }));
                              const matchingUnread = notifications.filter(n => !n.read && (String(n.metadata?.productId) === String(productId) || String(n.relatedId && n.relatedId.productId) === String(productId))).length;
                              setUnreadCount(prev => Math.max(0, prev - (matchingUnread || 1)));

                              apiService.markProductNotificationsRead(productId).then(() => {
                                loadNotifications();
                              }).catch(console.error);
                            } else if (notifId) {
                              setNotifications(prev => prev.map(n => (n.id === notifId || n._id === notifId) ? { ...n, read: true } : n));
                              setUnreadCount(prev => Math.max(0, prev - 1));
                              apiService.markNotificationRead(notifId).then(() => {
                                loadNotifications();
                              }).catch(console.error);
                            }

                            if (notification.type === 'negotiation' || notification.type === 'negotiation_update') {
                              if (userRole === 'farmer') {
                                if (productId) {
                                  navigate(`/farmer/product-bids/${productId}`);
                                } else if (notification.relatedId) {
                                  navigate(`/farmer/bids/${notification.relatedId}`);
                                } else {
                                  navigate('/farmer-dashboard');
                                }
                              } else {
                                navigate('/negotiations');
                              }
                            } else if (notification.type === 'chat') {
                              navigate('/messages');
                            } else {
                              if (userRole === 'farmer') {
                                navigate('/farmer-dashboard');
                              } else {
                                navigate('/notifications');
                              }
                            }
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                            <p style={{ margin: '0', fontSize: '0.88rem', fontWeight: notification.read ? 'normal' : '600', color: notification.read ? '#475569' : '#0f172a', lineHeight: '1.4' }}>
                              {notification.message}
                            </p>
                            {!notification.read && (
                              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', flexShrink: 0, marginTop: '4px' }}></span>
                            )}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                              {new Date(notification.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: notification.read ? '#10b981' : '#3b82f6', fontWeight: '600' }}>
                              {notification.read ? '✓ Read' : '● New'}
                            </span>
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
                <div className="profile-trigger" onClick={(e) => { e.stopPropagation(); toggleProfile(); }}>
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
              <button onClick={(e) => { e.stopPropagation(); handleNavigation('/login'); }} className="nav-btn nav-btn-login">
                <i className="fas fa-sign-in-alt"></i> Login
              </button>
              <button onClick={(e) => { e.stopPropagation(); handleNavigation('/register'); }} className="nav-btn nav-btn-register">
                <i className="fas fa-user-plus"></i> Register
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className={`nav-toggle ${menuOpen ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); toggleMenu(); }}>
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
