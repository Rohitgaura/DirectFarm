import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import apiService from '../../services/api';
import '../../styles/CropsHistory.css';

import authUtils from '../../utils/auth';

const CropsHistory = () => {
    const [crops, setCrops] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadCrops();
    }, []);

    const loadCrops = async () => {
        setIsLoading(true);
        try {
            const user = authUtils.getUser();
            if (!user) {
                toast.error('Please login to view history');
                setIsLoading(false);
                return;
            }

            const userId = user._id || user.id;
            const response = await apiService.getFarmerProducts(userId);

            if (response.success) {
                // Sort by upload date (newest first)
                const sortedCrops = (response.data || []).sort((a, b) =>
                    new Date(b.uploadDate || b.createdAt) - new Date(a.uploadDate || a.createdAt)
                );
                setCrops(sortedCrops);
            }
        } catch (error) {
            console.error('Error loading crops:', error);
            // Don't show error toast on 404 (just means empty)
            if (error.response && error.response.status !== 404) {
                toast.error('Failed to load crops history');
            }
        } finally {
            setIsLoading(false);
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

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'available':
                return '#4caf50';
            case 'sold':
                return '#f44336';
            case 'pending':
                return '#ffc107';
            default:
                return '#757575';
        }
    };

    return (
        <div className="crops-history-page">
            <div className="crops-history-container">
                <motion.div
                    className="crops-history-header"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1>
                        <i className="fas fa-history"></i>
                        Crops Upload History
                    </h1>
                    <p>View all your uploaded crops sorted by date</p>
                </motion.div>

                {isLoading ? (
                    <div className="loading-container">
                        <i className="fas fa-spinner fa-spin"></i>
                        <p>Loading crops...</p>
                    </div>
                ) : crops.length === 0 ? (
                    <motion.div
                        className="empty-crops"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <i className="fas fa-seedling"></i>
                        <h2>No crops uploaded yet</h2>
                        <p>Start uploading your crops to see them here!</p>
                    </motion.div>
                ) : (
                    <div className="crops-timeline">
                        {crops.map((crop, index) => (
                            <motion.div
                                key={crop._id || index}
                                className="crop-timeline-item"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                            >
                                <div className="timeline-marker">
                                    <i className="fas fa-leaf"></i>
                                </div>

                                <div className="crop-card-history">
                                    <div className="crop-card-header">
                                        <div className="crop-title-section">
                                            <h3>{crop.vegetableType || crop.name}</h3>
                                            <span
                                                className="crop-status-badge"
                                                style={{ backgroundColor: getStatusColor(crop.status) }}
                                            >
                                                {crop.status?.toUpperCase() || 'AVAILABLE'}
                                            </span>
                                        </div>
                                        <div className="upload-date">
                                            <i className="fas fa-calendar-alt"></i>
                                            {formatDate(crop.uploadDate || crop.createdAt)}
                                        </div>
                                    </div>

                                    <div className="crop-details-grid">
                                        <div className="detail-box">
                                            <i className="fas fa-weight"></i>
                                            <div className="detail-content">
                                                <span className="detail-label">Quantity</span>
                                                <span className="detail-value">{crop.quantity} kg</span>
                                            </div>
                                        </div>

                                        <div className="detail-box">
                                            <i className="fas fa-rupee-sign"></i>
                                            <div className="detail-content">
                                                <span className="detail-label">Price/kg</span>
                                                <span className="detail-value">₹{crop.ratePerKg || crop.pricePerKg}</span>
                                            </div>
                                        </div>

                                        <div className="detail-box">
                                            <i className="fas fa-calculator"></i>
                                            <div className="detail-content">
                                                <span className="detail-label">Total Value</span>
                                                <span className="detail-value">₹{crop.totalRate || (crop.quantity * crop.ratePerKg)}</span>
                                            </div>
                                        </div>

                                        {crop.harvestingDate && (
                                            <div className="detail-box">
                                                <i className="fas fa-calendar-check"></i>
                                                <div className="detail-content">
                                                    <span className="detail-label">Harvested</span>
                                                    <span className="detail-value">{formatDate(crop.harvestingDate)}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {crop.description && (
                                        <div className="crop-description-box">
                                            <i className="fas fa-info-circle"></i>
                                            <p>{crop.description}</p>
                                        </div>
                                    )}


                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CropsHistory;
