import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import authUtils from '../../utils/auth';
import '../../styles/SuccessStories.css';

const SuccessStories = () => {
    const [stories, setStories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        story: '',
        beforeIncome: '',
        currentIncome: '',
        improvements: '',
        cropTypes: '',
        yearsWithPlatform: '',
        village: '',
        district: '',
        state: ''
    });

    useEffect(() => {
        const storedUser = authUtils.getUser();
        if (storedUser) {
            setUser(storedUser);
        }
        loadStories();
    }, []);

    const loadStories = async () => {
        setIsLoading(true);
        try {
            const response = await apiService.getSuccessStories();
            if (response.success) {
                setStories(response.data || []);
            }
        } catch (error) {
            console.error('Error loading success stories:', error);
            toast.error('Failed to load success stories');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            toast.error('Please login to share your story');
            navigate('/login');
            return;
        }

        if (user.role !== 'farmer') {
            toast.error('Only farmers can share success stories');
            return;
        }

        try {
            const storyData = {
                ...formData,
                improvements: formData.improvements.split(',').map(i => i.trim()).filter(i => i),
                cropTypes: formData.cropTypes.split(',').map(c => c.trim()).filter(c => c),
                beforeIncome: parseFloat(formData.beforeIncome),
                currentIncome: parseFloat(formData.currentIncome),
                yearsWithPlatform: parseFloat(formData.yearsWithPlatform) || 0
            };

            const response = await apiService.submitSuccessStory(storyData);
            if (response.success) {
                toast.success('Success story submitted! It will be reviewed and published soon.');
                setShowForm(false);
                setFormData({
                    story: '',
                    beforeIncome: '',
                    currentIncome: '',
                    improvements: '',
                    cropTypes: '',
                    yearsWithPlatform: '',
                    village: '',
                    district: '',
                    state: ''
                });
            }
        } catch (error) {
            console.error('Error submitting story:', error);
            toast.error(error.response?.data?.message || 'Failed to submit story');
        }
    };

    const handleShareStory = () => {
        if (!user) {
            toast.error('Please login to share your story');
            navigate('/login');
            return;
        }

        if (user.role !== 'farmer') {
            toast.error('Only farmers can share success stories');
            return;
        }

        setShowForm(true);
    };

    return (
        <div className="success-stories-page">
            {/* Hero Section */}
            <motion.section
                className="stories-hero"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                <div className="stories-hero-content">
                    <motion.h1
                        initial={{ y: -30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        Farmer Success Stories
                    </motion.h1>
                    <motion.p
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        Real stories of transformation, growth, and success from our farming community
                    </motion.p>
                    {user && user.role === 'farmer' && !showForm && (
                        <motion.button
                            className="share-story-btn"
                            onClick={handleShareStory}
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.6 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <i className="fas fa-plus-circle"></i>
                            Share Your Story
                        </motion.button>
                    )}
                    {!user && (
                        <motion.button
                            className="share-story-btn"
                            onClick={handleShareStory}
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.6 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <i className="fas fa-sign-in-alt"></i>
                            Login to Share Your Story
                        </motion.button>
                    )}
                </div>
            </motion.section>

            {/* Submission Form */}
            {showForm && (
                <motion.section
                    className="story-form-section"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="container">
                        <div className="form-card">
                            <div className="form-header">
                                <h2>Share Your Success Story</h2>
                                <button className="close-form-btn" onClick={() => setShowForm(false)}>
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Your Story *</label>
                                        <textarea
                                            name="story"
                                            value={formData.story}
                                            onChange={handleInputChange}
                                            placeholder="Share your journey with DirectFarm... (50-1000 characters)"
                                            required
                                            minLength={50}
                                            maxLength={1000}
                                            rows={6}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Income Before DirectFarm (₹/month) *</label>
                                        <input
                                            type="number"
                                            name="beforeIncome"
                                            value={formData.beforeIncome}
                                            onChange={handleInputChange}
                                            placeholder="e.g., 15000"
                                            required
                                            min="0"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Current Income (₹/month) *</label>
                                        <input
                                            type="number"
                                            name="currentIncome"
                                            value={formData.currentIncome}
                                            onChange={handleInputChange}
                                            placeholder="e.g., 30000"
                                            required
                                            min="0"
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Key Improvements (comma-separated)</label>
                                        <input
                                            type="text"
                                            name="improvements"
                                            value={formData.improvements}
                                            onChange={handleInputChange}
                                            placeholder="e.g., New tractor, Children's education, Better house"
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Crop Types (comma-separated)</label>
                                        <input
                                            type="text"
                                            name="cropTypes"
                                            value={formData.cropTypes}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Tomatoes, Potatoes, Cauliflower"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Years with DirectFarm</label>
                                        <input
                                            type="number"
                                            name="yearsWithPlatform"
                                            value={formData.yearsWithPlatform}
                                            onChange={handleInputChange}
                                            placeholder="e.g., 2"
                                            min="0"
                                            step="0.5"
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Village</label>
                                        <input
                                            type="text"
                                            name="village"
                                            value={formData.village}
                                            onChange={handleInputChange}
                                            placeholder="Your village"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>District</label>
                                        <input
                                            type="text"
                                            name="district"
                                            value={formData.district}
                                            onChange={handleInputChange}
                                            placeholder="Your district"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>State</label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            placeholder="Your state"
                                        />
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="submit-btn">
                                        <i className="fas fa-paper-plane"></i>
                                        Submit Story
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </motion.section>
            )}

            {/* Stories Grid */}
            <section className="stories-grid-section">
                <div className="container">
                    {isLoading ? (
                        <div className="loading-container">
                            <i className="fas fa-spinner fa-spin"></i>
                            <p>Loading success stories...</p>
                        </div>
                    ) : stories.length === 0 ? (
                        <div className="empty-stories">
                            <i className="fas fa-star"></i>
                            <h2>No stories yet</h2>
                            <p>Be the first to share your success story!</p>
                        </div>
                    ) : (
                        <div className="stories-grid">
                            {stories.map((story, index) => (
                                <motion.div
                                    key={story._id}
                                    className="success-story-card"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                    <div className="story-card-header">
                                        <div className="farmer-info">
                                            <div className="farmer-avatar">
                                                {story.farmerName.charAt(0)}
                                            </div>
                                            <div>
                                                <h3>{story.farmerName}</h3>
                                                <p className="location">
                                                    <i className="fas fa-map-marker-alt"></i>
                                                    {story.location.village && `${story.location.village}, `}
                                                    {story.location.district && `${story.location.district}, `}
                                                    {story.location.state}
                                                </p>
                                            </div>
                                        </div>
                                        {story.isFeatured && (
                                            <div className="featured-badge">
                                                <i className="fas fa-star"></i>
                                                Featured
                                            </div>
                                        )}
                                    </div>

                                    <div className="income-stats">
                                        <div className="stat-box before">
                                            <span className="stat-label">Before</span>
                                            <span className="stat-value">₹{story.beforeIncome.toLocaleString()}</span>
                                        </div>
                                        <div className="stat-arrow">
                                            <i className="fas fa-arrow-right"></i>
                                        </div>
                                        <div className="stat-box after">
                                            <span className="stat-label">Current</span>
                                            <span className="stat-value">₹{story.currentIncome.toLocaleString()}</span>
                                        </div>
                                        <div className="improvement-badge">
                                            +{story.incomeImprovement}%
                                        </div>
                                    </div>

                                    <p className="story-text">"{story.story}"</p>

                                    {story.improvements && story.improvements.length > 0 && (
                                        <div className="improvements-list">
                                            <h4>Key Improvements:</h4>
                                            <ul>
                                                {story.improvements.map((improvement, idx) => (
                                                    <li key={idx}>
                                                        <i className="fas fa-check-circle"></i>
                                                        {improvement}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {story.cropTypes && story.cropTypes.length > 0 && (
                                        <div className="crop-tags">
                                            {story.cropTypes.map((crop, idx) => (
                                                <span key={idx} className="crop-tag">
                                                    <i className="fas fa-leaf"></i>
                                                    {crop}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {story.yearsWithPlatform > 0 && (
                                        <div className="years-badge">
                                            <i className="fas fa-calendar-alt"></i>
                                            {story.yearsWithPlatform} {story.yearsWithPlatform === 1 ? 'year' : 'years'} with DirectFarm
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default SuccessStories;
