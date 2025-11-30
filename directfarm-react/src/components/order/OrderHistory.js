import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import apiService from '../../services/api';
import authUtils from '../../utils/auth';
import RatingModal from '../common/RatingModal';
import '../../styles/OrderHistory.css';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        const storedUser = authUtils.getUser();
        if (storedUser) {
            setUser(storedUser);
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
        } finally {
            setIsLoading(false);
        }
    };

    const handleRateClick = (order) => {
        setSelectedOrder(order);
        setIsRatingModalOpen(true);
    };

    const handleRatingSubmit = async (ratingData) => {
        try {
            const response = await apiService.submitRating(ratingData);
            if (response.success) {
                toast.success('Rating submitted successfully');
                loadOrders(); // Reload orders to update rating status
            }
        } catch (error) {
            console.error('Error submitting rating:', error);
            toast.error(error.message || 'Failed to submit rating');
            throw error; // Re-throw to let modal handle loading state
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

    const canRate = (order) => {
        if (order.status !== 'delivered') return false;
        if (user?.role === 'buyer') return !order.isRatedByBuyer;
        if (user?.role === 'farmer') return !order.isRatedBySeller;
        return false;
    };

    const getRatedUserName = (order) => {
        if (!order) return '';
        if (user?.role === 'buyer') {
            // Assuming first item's farmer for now, or fetch farmer name from order details if available
            // In a real app, we might need to fetch farmer details or have it populated in order
            // The Order model has items array with farmerId.
            // We might need to populate farmer details in getOrders API.
            // For now, let's say "Farmer" or "Seller"
            return 'Seller';
        } else {
            return order.buyerId?.name || 'Buyer';
        }
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
                                    <div className="order-status-actions">
                                        <div className="order-status" style={{ backgroundColor: getStatusColor(order.status) }}>
                                            <i className={`fas ${getStatusIcon(order.status)}`}></i>
                                            <span>{order.status?.toUpperCase() || 'PENDING'}</span>
                                        </div>
                                        {canRate(order) && (
                                            <button
                                                className="rate-btn"
                                                onClick={() => handleRateClick(order)}
                                            >
                                                <i className="fas fa-star"></i> Rate User
                                            </button>
                                        )}
                                        {((user?.role === 'buyer' && order.isRatedByBuyer) || (user?.role === 'farmer' && order.isRatedBySeller)) && (
                                            <div className="rated-badge">
                                                <i className="fas fa-check"></i> Rated
                                            </div>
                                        )}
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

            <RatingModal
                isOpen={isRatingModalOpen}
                onClose={() => setIsRatingModalOpen(false)}
                onSubmit={handleRatingSubmit}
                orderId={selectedOrder?._id}
                ratedUserName={getRatedUserName(selectedOrder)}
            />
        </div>
    );
};

export default OrderHistory;
