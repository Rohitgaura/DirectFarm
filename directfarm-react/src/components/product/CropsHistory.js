import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import '../../styles/CropsHistory.css';

import authUtils from '../../utils/auth';

const CropsHistory = () => {
    const navigate = useNavigate();
    const [crops, setCrops] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'unsold', 'sold'

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

    const handleToggleStatus = async (cropId, currentStatus) => {
        const isCurrentlySold = (currentStatus || '').toLowerCase() === 'sold';
        const newStatus = isCurrentlySold ? 'active' : 'sold';
        try {
            const response = await apiService.updateProductStatus(cropId, { status: newStatus });
            if (response.success) {
                toast.success(isCurrentlySold ? 'Crop marked as Active & relisted!' : 'Crop marked as Sold Out & unlisted from public store!');
                setCrops(prev => prev.map(c => (c.id === cropId || c._id === cropId) ? { ...c, status: newStatus } : c));
            }
        } catch (error) {
            toast.error('Failed to update product status');
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
                    <p>View all your uploaded crops sorted by date with instant sold/unsold filters</p>
                </motion.div>

                {/* Status Filter Toolbar */}
                {!isLoading && crops.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                        <button
                            type="button"
                            onClick={() => setStatusFilter('all')}
                            style={{
                                padding: '0.5rem 1.1rem',
                                borderRadius: '25px',
                                border: '1px solid #cbd5e1',
                                background: statusFilter === 'all' ? '#0f172a' : '#ffffff',
                                color: statusFilter === 'all' ? '#ffffff' : '#475569',
                                fontWeight: '700',
                                cursor: 'pointer',
                                fontSize: '0.88rem',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
                            }}
                        >
                            All ({crops.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter('unsold')}
                            style={{
                                padding: '0.5rem 1.1rem',
                                borderRadius: '25px',
                                border: '1px solid #a7f3d0',
                                background: statusFilter === 'unsold' ? '#10b981' : '#ecfdf5',
                                color: statusFilter === 'unsold' ? '#ffffff' : '#047857',
                                fontWeight: '700',
                                cursor: 'pointer',
                                fontSize: '0.88rem',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
                            }}
                        >
                            🟢 Unsold / Active ({crops.filter(c => c.status !== 'sold').length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter('sold')}
                            style={{
                                padding: '0.5rem 1.1rem',
                                borderRadius: '25px',
                                border: '1px solid #fca5a5',
                                background: statusFilter === 'sold' ? '#ef4444' : '#fef2f2',
                                color: statusFilter === 'sold' ? '#ffffff' : '#b91c1c',
                                fontWeight: '700',
                                cursor: 'pointer',
                                fontSize: '0.88rem',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
                            }}
                        >
                            🔴 Sold Out ({crops.filter(c => c.status === 'sold').length})
                        </button>
                    </div>
                )}

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
                        {crops.filter(crop => {
                            if (statusFilter === 'unsold') return crop.status !== 'sold';
                            if (statusFilter === 'sold') return crop.status === 'sold';
                            return true;
                        }).map((crop, index) => (
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
                                        <div className="header-actions">
                                            <button
                                                className="toggle-status-btn"
                                                onClick={() => handleToggleStatus(crop.id || crop._id, crop.status)}
                                                title={crop.status === 'sold' ? 'Mark as Available' : 'Mark as Sold Out'}
                                                style={{
                                                    background: crop.status === 'sold' ? '#10b981' : '#f59e0b',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '0.4rem 0.85rem',
                                                    borderRadius: '6px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: '700',
                                                    cursor: 'pointer',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.4rem',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                }}
                                            >
                                                <i className={`fas fa-${crop.status === 'sold' ? 'check-circle' : 'tag'}`}></i>
                                                {crop.status === 'sold' ? 'Mark Available' : 'Mark Sold'}
                                            </button>
                                            <button
                                                className="edit-icon-btn"
                                                onClick={() => navigate('/farmer-dashboard', { state: { editCrop: crop } })}
                                                title="Edit Crop"
                                            >
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <div className="upload-date">
                                                <i className="fas fa-calendar-alt"></i>
                                                {formatDate(crop.uploadDate || crop.createdAt)}
                                            </div>
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
                                                <span className="detail-value">
                                                    ₹{(Number(crop.quantity || 0) * Number(crop.pricePerKg || 0)).toFixed(2)}
                                                </span>

                                            </div>
                                        </div>

                                        <div className="detail-box">
                                            <i className="fas fa-hourglass-half" style={{ color: '#d97706' }}></i>
                                            <div className="detail-content">
                                                <span className="detail-label">Auto-Removal</span>
                                                <span className="detail-value" style={{ color: '#059669', fontSize: '0.85rem' }}>
                                                    {crop.expiryDuration || 7} {crop.expiryUnit === 'hours' ? 'Hours' : 'Days'}
                                                </span>
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
