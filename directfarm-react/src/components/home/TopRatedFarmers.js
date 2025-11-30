import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import StarRating from '../common/StarRating';

const TopRatedFarmers = () => {
    const navigate = useNavigate();
    const [farmers, setFarmers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTopFarmers = async () => {
            try {
                const response = await apiService.getTopRatedUsers('farmer');
                if (response.success) {
                    setFarmers(response.data);
                }
            } catch (error) {
                console.error('Error fetching top rated farmers:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTopFarmers();
    }, []);

    if (loading) return null;
    if (farmers.length === 0) return null;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.5 }
        }
    };

    return (
        <section className="top-rated-farmers" style={{ padding: '4rem 0', background: '#f9fafb' }}>
            <div className="container">
                <motion.h2
                    className="section-title"
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    style={{ textAlign: 'center', marginBottom: '3rem', color: '#2c3e50', fontSize: '2.5rem' }}
                >
                    Top Rated Farmers
                </motion.h2>

                <motion.div
                    className="farmers-grid"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '2rem'
                    }}
                >
                    {farmers.map((farmer) => (
                        <motion.div
                            key={farmer._id}
                            className="farmer-card"
                            variants={itemVariants}
                            whileHover={{ y: -10, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                            onClick={() => navigate(`/farmer/${farmer.userId?._id || farmer._id}`)}
                            style={{
                                background: 'white',
                                padding: '2rem',
                                borderRadius: '15px',
                                textAlign: 'center',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                            }}
                        >
                            <div className="farmer-avatar" style={{
                                width: '80px',
                                height: '80px',
                                background: '#e0f2f1',
                                borderRadius: '50%',
                                margin: '0 auto 1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2rem',
                                color: '#27ae60'
                            }}>
                                <i className="fas fa-user-circle"></i>
                            </div>

                            <h3 style={{ marginBottom: '0.5rem', color: '#333' }}>
                                {farmer.userId?.name || 'Farmer'}
                            </h3>

                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                                <StarRating rating={farmer.averageRating} readOnly size="1.2rem" />
                            </div>

                            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                {farmer.totalRatings} reviews
                            </p>

                            {farmer.farmName && (
                                <p style={{ color: '#27ae60', fontWeight: '600' }}>
                                    <i className="fas fa-tractor" style={{ marginRight: '0.5rem' }}></i>
                                    {farmer.farmName}
                                </p>
                            )}
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default TopRatedFarmers;
