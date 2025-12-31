import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import apiService from '../../services/api';
import '../../styles/FarmerNegotiationPage.css';

const FarmerNegotiationPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [negotiation, setNegotiation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [counterPrice, setCounterPrice] = useState('');
    const [showCounterInput, setShowCounterInput] = useState(false);

    const fetchNegotiation = React.useCallback(async () => {
        try {
            const response = await apiService.getNegotiationById(id);
            console.log('Negotiation Data Received:', response);
            if (response.success) {
                setNegotiation(response.data);
            } else {
                toast.error(response.message || 'Failed to load negotiation');
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching negotiation:', error);
            toast.error('Failed to load negotiation details');
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchNegotiation();
    }, [fetchNegotiation]);

    const handleAction = async (status) => {
        try {
            const payload = { status };
            if (status === 'counter_offer') {
                if (!counterPrice || isNaN(counterPrice) || Number(counterPrice) <= 0) {
                    toast.error('Please enter a valid counter offer price');
                    return;
                }
                payload.counterOfferPrice = Number(counterPrice);
            }

            await apiService.updateNegotiationStatus(id, payload);
            toast.success(`Negotiation ${status === 'counter_offer' ? 'counter-offer sent' : status}`);
            fetchNegotiation(); // Refresh data
            if (status !== 'counter_offer') {
                setTimeout(() => navigate('/farmer-dashboard'), 2000);
            } else {
                setShowCounterInput(false);
            }
        } catch (error) {
            console.error('Error updating negotiation:', error);
            toast.error(error.message || 'Failed to update negotiation');
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading negotiation details...</p>
            </div>
        );
    }

    if (!negotiation) {
        return (
            <div className="error-container">
                <h2>Negotiation not found</h2>
                <button onClick={() => navigate('/farmer-dashboard')} className="btn-secondary">
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="negotiation-page">
            <div className="negotiation-container">
                <motion.div
                    className="negotiation-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="card-header">
                        <h2>Negotiation Request</h2>
                        <span className={`status-badge ${negotiation.status || 'pending'}`}>
                            {(negotiation.status || 'pending').replace('_', ' ')}
                        </span>
                    </div>

                    <div className="product-details">
                        <img
                            src={negotiation.productId?.image || 'https://via.placeholder.com/150'}
                            alt={negotiation.productId?.name}
                            className="product-image"
                        />
                        <div className="product-info">
                            <h3>{negotiation.productId?.name}</h3>
                            <p className="original-price">Original Price: ₹{negotiation.productId?.price}/kg</p>
                        </div>
                    </div>

                    <div className="offer-details">
                        <div className="detail-row">
                            <span className="label">Buyer:</span>
                            <span className="value">{negotiation.buyerId?.name}</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Quantity Requested:</span>
                            <span className="value">{negotiation.quantity} kg</span>
                        </div>
                        <div className="detail-row highlight">
                            <span className="label">Offered Price:</span>
                            <span className="value">₹{negotiation.offeredPrice}/kg</span>
                        </div>
                        <div className="detail-row total">
                            <span className="label">Total Value:</span>
                            <span className="value">₹{negotiation.quantity * negotiation.offeredPrice}</span>
                        </div>

                        {negotiation.counterOfferPrice && (
                            <div className="detail-row counter">
                                <span className="label">Your Counter Offer:</span>
                                <span className="value">₹{negotiation.counterOfferPrice}/kg</span>
                            </div>
                        )}
                    </div>

                    {negotiation.status === 'pending' && (
                        <div className="action-buttons">
                            {!showCounterInput ? (
                                <>
                                    <button
                                        className="btn-accept"
                                        onClick={() => handleAction('accepted')}
                                    >
                                        <i className="fas fa-check"></i> Accept Offer
                                    </button>
                                    <button
                                        className="btn-counter"
                                        onClick={() => setShowCounterInput(true)}
                                    >
                                        <i className="fas fa-exchange-alt"></i> Counter Offer
                                    </button>
                                    <button
                                        className="btn-decline"
                                        onClick={() => handleAction('rejected')}
                                    >
                                        <i className="fas fa-times"></i> Decline
                                    </button>
                                </>
                            ) : (
                                <div className="counter-input-group">
                                    <input
                                        type="number"
                                        placeholder="Enter your price per kg"
                                        value={counterPrice}
                                        onChange={(e) => setCounterPrice(e.target.value)}
                                        autoFocus
                                    />
                                    <div className="counter-actions">
                                        <button
                                            className="btn-submit-counter"
                                            onClick={() => handleAction('counter_offer')}
                                        >
                                            Send Offer
                                        </button>
                                        <button
                                            className="btn-cancel"
                                            onClick={() => setShowCounterInput(false)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default FarmerNegotiationPage;
