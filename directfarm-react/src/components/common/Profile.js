import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import apiService from '../../services/api';
import authUtils from '../../utils/auth';
import StarRating from '../common/StarRating';
import '../../styles/Profile.css';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        role: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const loadUserData = React.useCallback(async () => {
        // First load from authUtils for immediate display
        const userData = authUtils.getUser();
        if (userData) {
            setUser(userData);
            setFormData({
                name: userData.name || '',
                email: userData.email || '',
                phone: userData.phone || '',
                address: userData.address || '',
                role: userData.role || ''
            });
        }

        // Then fetch fresh data from API
        try {
            const response = await apiService.getProfile();
            if (response.success) {
                const freshUser = response.data.user;
                setUser(freshUser);
                // Update authUtils
                authUtils.updateUser(freshUser);

                // Only update form data if not editing
                if (!isEditing) {
                    setFormData({
                        name: freshUser.name || '',
                        email: freshUser.email || '',
                        phone: freshUser.phone || '',
                        address: freshUser.address || '',
                        role: freshUser.role || ''
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    }, [isEditing]);

    useEffect(() => {
        loadUserData();
    }, [loadUserData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await apiService.updateProfile(formData);

            if (response.success) {
                // Update authUtils with new data
                const updatedUser = { ...user, ...formData };
                authUtils.updateUser(updatedUser);
                setUser(updatedUser);

                // Dispatch event to update navbar
                window.dispatchEvent(new Event('userChanged'));

                toast.success('Profile updated successfully!');
                setIsEditing(false);
            } else {
                throw new Error(response.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        loadUserData();
        setIsEditing(false);
    };

    if (!user) {
        return (
            <div className="profile-page">
                <div className="loading-container">
                    <i className="fas fa-spinner fa-spin"></i>
                    <p>Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="profile-container">
                <motion.div
                    className="profile-header"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="profile-avatar-large">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <h1>{user.name || 'User'}</h1>
                    <p className="user-role">{user.role?.toUpperCase() || 'USER'}</p>
                </motion.div>

                <motion.div
                    className="profile-content"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <div className="profile-card">
                        <div className="card-header">
                            <h2>
                                <i className="fas fa-user-circle"></i>
                                Personal Information
                            </h2>
                            {!isEditing && (
                                <button onClick={() => setIsEditing(true)} className="edit-btn">
                                    <i className="fas fa-edit"></i>
                                    Edit Profile
                                </button>
                            )}
                        </div>

                        {isEditing ? (
                            <form onSubmit={handleSubmit} className="profile-form">
                                <div className="form-group">
                                    <label htmlFor="name">
                                        <i className="fas fa-user"></i>
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">
                                        <i className="fas fa-envelope"></i>
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="phone">
                                        <i className="fas fa-phone"></i>
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="address">
                                        <i className="fas fa-map-marker-alt"></i>
                                        Address
                                    </label>
                                    <textarea
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        rows="3"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="role">
                                        <i className="fas fa-briefcase"></i>
                                        Role
                                    </label>
                                    <input
                                        type="text"
                                        id="role"
                                        name="role"
                                        value={formData.role}
                                        disabled
                                        className="disabled-input"
                                    />
                                    <small>Role cannot be changed</small>
                                </div>

                                <div className="form-actions">
                                    <button type="submit" className="save-btn" disabled={isLoading}>
                                        {isLoading ? (
                                            <>
                                                <i className="fas fa-spinner fa-spin"></i>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-save"></i>
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                    <button type="button" onClick={handleCancel} className="cancel-btn" disabled={isLoading}>
                                        <i className="fas fa-times"></i>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="profile-info">
                                <div className="info-item">
                                    <div className="info-label">
                                        <i className="fas fa-user"></i>
                                        Full Name
                                    </div>
                                    <div className="info-value">{user.name || 'Not provided'}</div>
                                </div>

                                <div className="info-item">
                                    <div className="info-label">
                                        <i className="fas fa-envelope"></i>
                                        Email Address
                                    </div>
                                    <div className="info-value">{user.email || 'Not provided'}</div>
                                </div>

                                <div className="info-item">
                                    <div className="info-label">
                                        <i className="fas fa-phone"></i>
                                        Phone Number
                                    </div>
                                    <div className="info-value">{user.phone || 'Not provided'}</div>
                                </div>

                                <div className="info-item">
                                    <div className="info-label">
                                        <i className="fas fa-map-marker-alt"></i>
                                        Address
                                    </div>
                                    <div className="info-value">{user.address || 'Not provided'}</div>
                                </div>

                                <div className="info-item">
                                    <div className="info-label">
                                        <i className="fas fa-briefcase"></i>
                                        Role
                                    </div>
                                    <div className="info-value role-badge">{user.role?.toUpperCase() || 'USER'}</div>
                                </div>

                                <div className="info-item">
                                    <div className="info-label">
                                        <i className="fas fa-star"></i>
                                        Rating
                                    </div>
                                    <div className="info-value" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <StarRating rating={user.averageRating || 0} readOnly size="1.2rem" />
                                        <span style={{ color: '#666', fontSize: '0.9rem' }}>
                                            ({user.totalRatings || 0} reviews)
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Profile;
