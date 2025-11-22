import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import apiService from '../../services/api';
import '../../styles/OrderHistory.css';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        loadOrders();
    }, []);

    const loadOrders = async () => {
        setIsLoading(true);
        try {
            const response = await apiService.getOrders();
            if (response.success) {
                setOrders(response.data || []);
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            toast.error('Failed to load order history');
            // Mock data for demonstration
            setOrders([
                {
                    _id: '1',
                    items: [
                        {
                            productId: { name: 'Tomato', pricePerKg: 25 },
                            quantity: 10,
                            price: 25
                        }
                    ],
                    totalAmount: 250,
                    status: 'delivered',
                    createdAt: '2024-01-15T10:30:00Z'
                }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return '#ffc107';
            case 'confirmed':
                return '#2196f3';
            case 'shipped':
                return '#9c27b0';
            case 'delivered':
                return '#4caf50';
            case 'cancelled':
                return '#f44336';
            default:
                return '#757575';
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return 'fa-clock';
            case 'confirmed':
                return 'fa-check-circle';
            case 'shipped':
                return 'fa-truck';
            case 'delivered':
                return 'fa-check-double';
            case 'cancelled':
                return 'fa-times-circle';
            default:
                return 'fa-info-circle';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="order-history-page">
            <div className="order-history-container">
                <motion.div
                    className="order-history-header"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1>
                        <i className="fas fa-history"></i>
                        Order History
                    </h1>
                    <p>Track your orders and view past purchases</p>
                </motion.div>

                {isLoading ? (
                    <div className="loading-container">
                        <i className="fas fa-spinner fa-spin"></i>
                        <p>Loading orders...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <motion.div
                        className="empty-orders"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <i className="fas fa-shopping-bag"></i>
                        <h2>No orders yet</h2>
                        <p>Start shopping to see your order history here!</p>
                    </motion.div>
                ) : (
                    <div className="orders-list">
                        {orders.map((order, index) => (
                            <motion.div
                                key={order._id}
                                className="order-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                            >
                                <div className="order-header">
                                    <div className="order-id">
                                        <span className="label">Order ID:</span>
                                        <span className="value">#{order._id.slice(-8).toUpperCase()}</span>
                                    </div>
                                    <div className="order-date">
                                        <i className="fas fa-calendar-alt"></i>
                                        {formatDate(order.createdAt)}
                                    </div>
                                </div>

                                <div className="order-items">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="order-item">
                                            <div className="item-icon">
                                                <i className="fas fa-leaf"></i>
                                            </div>
                                            <div className="item-details">
                                                <h4>{item.productId?.name || 'Product'}</h4>
                                                <p className="item-quantity">{item.quantity} kg × ₹{item.price}/kg</p>
                                            </div>
                                            <div className="item-total">
                                                ₹{(item.quantity * item.price).toFixed(2)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="order-footer">
                                    <div className="order-status" style={{ backgroundColor: getStatusColor(order.status) }}>
                                        <i className={`fas ${getStatusIcon(order.status)}`}></i>
                                        <span>{order.status?.toUpperCase() || 'PENDING'}</span>
                                    </div>
                                    <div className="order-total">
                                        <span className="total-label">Total:</span>
                                        <span className="total-amount">₹{order.totalAmount?.toFixed(2)}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderHistory;
