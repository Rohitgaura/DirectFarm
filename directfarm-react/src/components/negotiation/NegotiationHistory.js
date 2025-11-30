import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import apiService from '../../services/api';
import '../../styles/NegotiationHistory.css';

const NegotiationHistory = () => {
  const navigate = useNavigate();
  const [negotiations, setNegotiations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNegotiations = async () => {
      try {
        const response = await apiService.getBuyerNegotiations();
        if (response.success) {
          setNegotiations(response.data);
        } else {
          toast.error('Failed to load negotiations');
        }
      } catch (error) {
        console.error('Error fetching negotiations:', error);
        toast.error(error.message || 'Error loading negotiations');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNegotiations();
  }, []);

  const handleDelete = async (negotiationId) => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      'Are you sure you want to delete this negotiation request? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      const response = await apiService.deleteNegotiation(negotiationId);
      if (response.success) {
        toast.success('Negotiation deleted successfully');
        // Remove from local state
        setNegotiations(negotiations.filter(n => n._id !== negotiationId));
      } else {
        toast.error(response.message || 'Failed to delete negotiation');
      }
    } catch (error) {
      console.error('Error deleting negotiation:', error);
      toast.error(error.message || 'Error deleting negotiation');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted': return 'fa-check-circle';
      case 'rejected': return 'fa-times-circle';
      default: return 'fa-clock';
    }
  };

  if (isLoading) {
    return (
      <div className="negotiation-history-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your negotiations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="negotiation-history-page">
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1>Negotiation History</h1>
        <p>Track your offers and their status</p>
      </motion.div>

      <div className="negotiations-container">
        {negotiations.length === 0 ? (
          <motion.div
            className="no-negotiations"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <i className="fas fa-handshake-slash"></i>
            <h3>No negotiations yet</h3>
            <p>Make an offer on a product to start negotiating!</p>
          </motion.div>
        ) : (
          <div className="negotiations-list">
            {negotiations.map((negotiation, index) => (
              <motion.div
                key={negotiation._id}
                className="negotiation-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="card-header">
                  <div className="product-info">
                    <div className="product-icon">
                      <i className="fas fa-carrot"></i>
                    </div>
                    <div className="product-details">
                      <h3>{negotiation.productId?.name || 'Unknown Product'}</h3>
                      <div className="date">
                        <i className="far fa-calendar-alt"></i>
                        {new Date(negotiation.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                  <div className={`status-badge ${negotiation.status}`}>
                    <i className={`fas ${getStatusIcon(negotiation.status)}`}></i>
                    {negotiation.status}
                  </div>
                </div>

                <div className="card-body">
                  <div className="info-group">
                    <label>Farmer</label>
                    <div className="value">
                      <i className="fas fa-user"></i>
                      {negotiation.farmerId?.name || 'Unknown Farmer'}
                    </div>
                  </div>
                  <div className="info-group">
                    <label>Quantity</label>
                    <div className="value">
                      <i className="fas fa-weight"></i>
                      {negotiation.quantity} kg
                    </div>
                  </div>
                  <div className="info-group">
                    <label>Offered Price</label>
                    <div className="value">
                      <i className="fas fa-tag"></i>
                      ₹{negotiation.offeredPrice}/kg
                    </div>
                  </div>
                  <div className="info-group total">
                    <label>Total Value</label>
                    <div className="value">
                      ₹{(negotiation.quantity * negotiation.offeredPrice).toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="card-actions">
                  {negotiation.status === 'pending' && (
                    <motion.button
                      className="delete-btn"
                      onClick={() => handleDelete(negotiation._id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <i className="fas fa-trash-alt"></i>
                      Delete Request
                    </motion.button>
                  )}

                  {negotiation.status === 'accepted' && (
                    <motion.button
                      className="pay-now-btn"
                      onClick={() => {
                        const cartItem = {
                          productId: negotiation.productId?._id,
                          vegetableType: negotiation.productId?.name,
                          quantity: negotiation.quantity,
                          totalPrice: (negotiation.offeredPrice * negotiation.quantity).toFixed(2),
                          pricePerKg: negotiation.offeredPrice
                        };

                        localStorage.setItem('cart', JSON.stringify([cartItem]));
                        navigate('/checkout');
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      <i className="fas fa-credit-card"></i>
                      Pay Now
                    </motion.button>
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

export default NegotiationHistory;
