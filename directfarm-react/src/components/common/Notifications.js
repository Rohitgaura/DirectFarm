import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiService from '../../services/api';
import authUtils from '../../utils/auth';
import '../../styles/BuyerDashboard.css';

const Notifications = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterMode, setFilterMode] = useState('unread_first'); // 'unread_first', 'all', 'unread'

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            const response = await apiService.getNotifications();
            if (response.success) {
                setNotifications(response.data);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const unreadCount = useMemo(() => {
        return notifications.filter(n => !n.read).length;
    }, [notifications]);

    const displayedNotifications = useMemo(() => {
        let list = [...notifications];
        if (filterMode === 'unread') {
            list = list.filter(n => !n.read);
        } else if (filterMode === 'unread_first') {
            list.sort((a, b) => {
                if (!a.read && b.read) return -1;
                if (a.read && !b.read) return 1;
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
        }
        return list;
    }, [notifications, filterMode]);

    const markAsRead = async (id) => {
        try {
            await apiService.markNotificationRead(id);
            setNotifications(prev =>
                prev.map(n => (n.id === id || n._id === id) ? { ...n, read: true } : n)
            );
            window.dispatchEvent(new Event('notificationUpdated'));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            await apiService.markAllNotificationsRead();
            window.dispatchEvent(new Event('notificationUpdated'));
        } catch (error) {
            console.error('Error marking all notifications read:', error);
        }
    };

    const handleNotificationClick = (notification) => {
        const notifId = notification.id || notification._id;
        const productId = notification.metadata?.productId || (notification.relatedId && notification.relatedId.productId);

        const currentUser = authUtils.getUser();
        const userRole = currentUser?.role;

        if (productId && userRole === 'farmer') {
            apiService.markProductNotificationsRead(productId).then(() => {
                window.dispatchEvent(new Event('notificationUpdated'));
            }).catch(console.error);
        } else if (notifId) {
            markAsRead(notifId);
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
                navigate('/buyer-dashboard');
            }
        }
    };

    if (loading) {
        return (
            <div className="dashboard-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="buyer-dashboard" style={{ minHeight: '85vh', background: '#f8fafc', padding: '2rem 1rem' }}>
            <div className="dashboard-container" style={{ maxWidth: '850px', margin: '0 auto' }}>
                <div className="dashboard-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ margin: '0 0 0.4rem 0', fontSize: '1.8rem', color: '#0f172a', fontWeight: '800' }}>Notifications</h1>
                        <p style={{ margin: '0', color: '#64748b', fontSize: '0.95rem' }}>Stay updated with your latest offers, bids, and activities</p>
                    </div>

                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            style={{
                                background: '#ecfdf5',
                                border: '1px solid #a7f3d0',
                                color: '#059669',
                                padding: '0.55rem 1rem',
                                borderRadius: '10px',
                                fontWeight: '700',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem'
                            }}
                        >
                            <i className="fas fa-check-double"></i> Mark All as Read
                        </button>
                    )}
                </div>

                {/* Filter Toolbar */}
                {notifications.length > 0 && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: '#ffffff',
                        padding: '0.65rem 1rem',
                        borderRadius: '14px',
                        border: '1px solid #e2e8f0',
                        marginBottom: '1.25rem',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                        flexWrap: 'wrap',
                        gap: '0.75rem'
                    }}>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <button
                                onClick={() => setFilterMode('unread_first')}
                                style={{
                                    padding: '0.45rem 0.9rem',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: filterMode === 'unread_first' ? '#10b981' : '#f1f5f9',
                                    color: filterMode === 'unread_first' ? '#ffffff' : '#334155',
                                    fontWeight: '700',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <i className="fas fa-arrow-up-wide-short"></i> Unread on Top
                            </button>

                            <button
                                onClick={() => setFilterMode('all')}
                                style={{
                                    padding: '0.45rem 0.9rem',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: filterMode === 'all' ? '#10b981' : '#f1f5f9',
                                    color: filterMode === 'all' ? '#ffffff' : '#334155',
                                    fontWeight: '600',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer'
                                }}
                            >
                                All ({notifications.length})
                            </button>

                            {unreadCount > 0 && (
                                <button
                                    onClick={() => setFilterMode('unread')}
                                    style={{
                                        padding: '0.45rem 0.9rem',
                                        borderRadius: '10px',
                                        border: 'none',
                                        background: filterMode === 'unread' ? '#ef4444' : '#fef2f2',
                                        color: filterMode === 'unread' ? '#ffffff' : '#ef4444',
                                        fontWeight: '700',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Unread ({unreadCount})
                                </button>
                            )}
                        </div>

                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                            Showing <strong>{displayedNotifications.length}</strong> items
                        </div>
                    </div>
                )}

                <div className="results-section">
                    {displayedNotifications.length === 0 ? (
                        <div className="no-results" style={{ background: 'white', padding: '3rem 1.5rem', borderRadius: '16px', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
                            <i className="fas fa-bell-slash" style={{ fontSize: '3rem', color: '#cbd5e1', marginBottom: '1rem', display: 'block' }}></i>
                            <h3 style={{ margin: '0 0 0.5rem 0', color: '#334155' }}>
                                {filterMode === 'unread' ? 'No Unread Notifications' : 'No Notifications'}
                            </h3>
                            <p style={{ margin: 0, color: '#64748b' }}>You're all caught up!</p>
                        </div>
                    ) : (
                        <div className="notifications-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {displayedNotifications.map((notification) => (
                                <motion.div
                                    key={notification.id || notification._id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`notification-item ${!notification.read ? 'unread' : 'read'}`}
                                    style={{
                                        padding: '1.25rem',
                                        background: notification.read ? '#ffffff' : '#f0f9ff',
                                        cursor: 'pointer',
                                        borderRadius: '14px',
                                        border: notification.read ? '1px solid #e2e8f0' : '1px solid #bae6fd',
                                        borderLeft: notification.read ? '4px solid #cbd5e1' : '4px solid #0284c7',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                                        transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                                    }}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div style={{
                                            width: '46px',
                                            height: '46px',
                                            borderRadius: '12px',
                                            background: notification.read ? '#f1f5f9' : '#e0f2fe',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: notification.read ? '#64748b' : '#0284c7',
                                            fontSize: '1.2rem',
                                            flexShrink: 0
                                        }}>
                                            <i className={
                                                notification.type === 'negotiation'
                                                    ? 'fas fa-gavel'
                                                    : (notification.type === 'chat' ? 'fas fa-comment-dots' : 'fas fa-bell')
                                            }></i>
                                        </div>
                                        <div>
                                            <p style={{
                                                margin: '0 0 0.35rem 0',
                                                fontSize: '1rem',
                                                fontWeight: notification.read ? '500' : '700',
                                                color: notification.read ? '#334155' : '#0f172a'
                                            }}>
                                                {notification.message}
                                            </p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                                    <i className="fas fa-clock" style={{ marginRight: '4px' }}></i>
                                                    {new Date(notification.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                                </span>
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    fontWeight: '700',
                                                    color: notification.read ? '#10b981' : '#0284c7'
                                                }}>
                                                    {notification.read ? '✓ Read' : '● New Offer'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {!notification.read && (
                                        <div style={{
                                            width: '10px',
                                            height: '10px',
                                            borderRadius: '50%',
                                            background: '#0284c7',
                                            flexShrink: 0
                                        }}></div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notifications;
