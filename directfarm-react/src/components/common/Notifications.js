import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiService from '../../services/api';
import '../../styles/BuyerDashboard.css'; // Reuse dashboard styles

const Notifications = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const markAsRead = async (id) => {
        try {
            await apiService.markNotificationRead(id);
            // Update local state to reflect read status
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, read: true } : n)
            );
            // Trigger navbar update
            window.dispatchEvent(new Event('userChanged'));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleNotificationClick = (notification) => {
        markAsRead(notification._id);

        if (notification.type === 'negotiation' || notification.type === 'negotiation_update') {
            // For now, redirect to negotiations page as a generic fallback
            // Ideally we would go to specific negotiation if ID was available in a consistent way
            navigate('/negotiations');
        } else if (notification.type === 'chat') {
            // Chat handling is complex as it requires opening a modal
            // For now, we can redirect to messages page if it exists, or just mark as read
            // Since we don't have a dedicated full-page chat yet (it's a modal), 
            // we might just show a toast or do nothing other than mark read
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
        <div className="buyer-dashboard">
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <h1>Notifications</h1>
                    <p>Stay updated with your latest activities</p>
                </div>

                <div className="results-section" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    {notifications.length === 0 ? (
                        <div className="no-results">
                            <i className="fas fa-bell-slash"></i>
                            <h3>No Notifications</h3>
                            <p>You're all caught up!</p>
                        </div>
                    ) : (
                        <div className="notifications-list">
                            {notifications.map((notification) => (
                                <motion.div
                                    key={notification._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                                    style={{
                                        padding: '1.5rem',
                                        borderBottom: '1px solid #eee',
                                        background: notification.read ? 'white' : '#f0f9ff',
                                        cursor: 'pointer',
                                        borderRadius: '10px',
                                        marginBottom: '1rem',
                                        border: notification.read ? '1px solid #eee' : '1px solid #bae7ff',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '50%',
                                            background: notification.type === 'alert' ? '#ffebee' : '#e3f2fd',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: notification.type === 'alert' ? '#c62828' : '#1565c0',
                                            fontSize: '1.2rem'
                                        }}>
                                            <i className={`fas ${notification.type === 'alert' ? 'fa-exclamation-circle' : 'fa-bell'}`}></i>
                                        </div>
                                        <div>
                                            <p style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#333' }}>{notification.message}</p>
                                            <span style={{ fontSize: '0.85rem', color: '#888' }}>
                                                {new Date(notification.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                    {!notification.read && (
                                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2196f3' }}></div>
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
