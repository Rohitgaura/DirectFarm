import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiService from '../../services/api';
import StarRating from '../common/StarRating';
import '../../styles/BuyerDashboard.css'; // Reuse existing styles
import '../../styles/FarmerProfile.css'; // New styles for profile specific components

const FarmerProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [farmer, setFarmer] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFarmerData = async () => {
            try {
                setLoading(true);
                const response = await apiService.getFarmer(id);
                if (response.success) {
                    setFarmer(response.data.farmer);
                    // Transform products to match BuyerDashboard format if needed, 
                    // but for now we'll use the raw data and display it simply
                    setProducts(response.data.products.items);
                } else {
                    setError('Failed to load farmer data');
                }
            } catch (err) {
                console.error('Error fetching farmer profile:', err);
                setError('Error loading profile');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchFarmerData();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="dashboard-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (error || !farmer) {
        return (
            <div className="dashboard-container" style={{ textAlign: 'center', padding: '4rem' }}>
                <h2>Farmer not found</h2>
                <button className="btn btn-primary" onClick={() => navigate(-1)}>Go Back</button>
            </div>
        );
    }

    return (
        <div className="buyer-dashboard">
            <div className="dashboard-container">
                <button
                    className="btn btn-outline"
                    onClick={() => navigate(-1)}
                    style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', borderColor: 'white' }}
                >
                    <i className="fas fa-arrow-left"></i> Back
                </button>

                {/* Farmer Header Profile */}
                <motion.div
                    className="farmer-profile-header"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        background: 'white',
                        padding: '2rem',
                        borderRadius: '15px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center'
                    }}
                >
                    <div className="farmer-avatar" style={{
                        width: '100px',
                        height: '100px',
                        background: '#e0f2f1',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3rem',
                        color: '#27ae60',
                        marginBottom: '1rem'
                    }}>
                        <i className="fas fa-user-circle"></i>
                    </div>

                    <h1 style={{ marginBottom: '0.5rem', color: '#2c3e50' }}>{farmer.name}</h1>

                    {farmer.farmName && (
                        <h3 style={{ color: '#27ae60', marginBottom: '1rem' }}>
                            <i className="fas fa-tractor" style={{ marginRight: '0.5rem' }}></i>
                            {farmer.farmName}
                        </h3>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                        <StarRating rating={farmer.averageRating || 0} readOnly size="1.2rem" />
                        <span style={{ color: '#666' }}>
                            ({farmer.totalRatings || 0} reviews)
                        </span>
                    </div>

                    <div style={{ display: 'flex', gap: '2rem', color: '#666' }}>
                        {farmer.address && (
                            <span><i className="fas fa-map-marker-alt" style={{ marginRight: '0.5rem' }}></i>{farmer.address}</span>
                        )}
                        <span><i className="fas fa-calendar-alt" style={{ marginRight: '0.5rem' }}></i>Member since {new Date(farmer.createdAt).getFullYear()}</span>
                    </div>
                </motion.div>

                {/* Available Products Section */}
                <h2 style={{ marginBottom: '1.5rem', color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>Available Products</h2>

                {products.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '10px' }}>
                        <p style={{ color: '#666', fontSize: '1.1rem' }}>No products currently available.</p>
                    </div>
                ) : (
                    <div className="products-grid">
                        {products.map((product) => (
                            <motion.div
                                key={product._id}
                                className="product-card"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                whileHover={{ y: -5 }}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: '100%' // Ensure full height logic works if grid is set
                                }}
                            >
                                <div className="product-image" style={{ height: '200px', overflow: 'hidden' }}>
                                    {product.images && product.images.length > 0 ? (
                                        <img
                                            src={product.images[0]}
                                            alt={product.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div className="no-image" style={{
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: '#f5f6fa',
                                            color: '#dcdde1',
                                            fontSize: '3rem'
                                        }}>
                                            <i className="fas fa-leaf"></i>
                                        </div>
                                    )}
                                    <div className="product-badge">Available</div>
                                </div>

                                <div className="product-info" style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <div className="product-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#2c3e50' }}>{product.name}</h3>
                                        <span className="price" style={{
                                            background: '#e8f5e9',
                                            color: '#27ae60',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '20px',
                                            fontWeight: '600',
                                            whiteSpace: 'nowrap'
                                        }}>₹{product.pricePerKg}/kg</span>
                                    </div>

                                    <p className="description" style={{
                                        color: '#666',
                                        lineHeight: '1.6',
                                        marginBottom: '1.5rem',
                                        flex: 1 // Push meta down
                                    }}>
                                        {product.description || 'No description available for this product.'}
                                    </p>

                                    <div className="product-meta" style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: '1rem',
                                        fontSize: '0.9rem',
                                        color: '#7f8c8d',
                                        background: '#f8f9fa',
                                        padding: '1rem',
                                        borderRadius: '8px'
                                    }}>
                                        <span>
                                            <i className="fas fa-weight-hanging" style={{ marginRight: '0.5rem', color: '#3498db' }}></i>
                                            {product.quantity} kg left
                                        </span>
                                        {product.harvestingDate && (
                                            <span>
                                                <i className="fas fa-clock" style={{ marginRight: '0.5rem', color: '#e67e22' }}></i>
                                                Harvest: {new Date(product.harvestingDate).toLocaleDateString()}
                                            </span>
                                        )}
                                        {product.location && (product.location.district || product.location.state) && (
                                            <span style={{ gridColumn: 'span 2' }}>
                                                <i className="fas fa-map-marker-alt" style={{ marginRight: '0.5rem', color: '#e74c3c' }}></i>
                                                {[product.location.village, product.location.district, product.location.state].filter(Boolean).join(', ')}
                                            </span>
                                        )}
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

export default FarmerProfile;
