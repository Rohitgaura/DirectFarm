import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiService from '../../services/api';
import '../../styles/Auth.css';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password, 3: Success
    const [email, setEmail] = useState('');
    const [formData, setFormData] = useState({
        otp: '',
        password: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            setErrors({ email: 'Please enter a valid email address' });
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            await apiService.forgotPassword(email);
            toast.success('OTP sent to your email!');
            setStep(2);
        } catch (error) {
            setErrors({ global: error.message || 'Failed to send OTP' });
            toast.error(error.message || 'Failed to send OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        if (!formData.otp || formData.otp.length !== 6) {
            newErrors.otp = 'Please enter a valid 6-digit OTP';
        }
        if (!formData.password || formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            await apiService.resetPassword({
                email,
                otp: formData.otp,
                password: formData.password
            });
            setStep(3);
            toast.success('Password changed successfully!');
        } catch (error) {
            setErrors({ global: error.message || 'Failed to reset password' });
            toast.error(error.message || 'Failed to reset password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-background">
                <div className="auth-overlay"></div>
            </div>

            <div className="auth-container">
                <motion.div
                    className="auth-card"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="auth-header">
                        <motion.div
                            className="auth-logo"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <i className="fas fa-seedling"></i>
                            <span>DirectFarm</span>
                        </motion.div>
                        <h1>
                            {step === 1 ? 'Forgot Password?' : step === 2 ? 'Reset Password' : 'Success!'}
                        </h1>
                        <p>
                            {step === 1
                                ? 'Enter your email to receive an OTP'
                                : step === 2
                                    ? 'Enter the OTP sent to your email'
                                    : 'Your password has been updated'}
                        </p>
                    </div>

                    {errors.global && (
                        <div className="global-error">
                            <i className="fas fa-exclamation-triangle"></i>
                            {errors.global}
                        </div>
                    )}

                    {step === 1 && (
                        <form onSubmit={handleEmailSubmit} className="auth-form">
                            <div className="form-group">
                                <label htmlFor="email">
                                    <i className="fas fa-envelope"></i>
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className={errors.email ? 'error' : ''}
                                />
                                {errors.email && <span className="error-message">{errors.email}</span>}
                            </div>

                            <button type="submit" className="auth-submit" disabled={isLoading}>
                                {isLoading ? 'Sending OTP...' : 'Send OTP'}
                            </button>

                            <div className="auth-footer">
                                <Link to="/login" className="auth-link">Back to Login</Link>
                            </div>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleResetSubmit} className="auth-form">
                            <div className="form-group">
                                <label htmlFor="otp">
                                    <i className="fas fa-key"></i>
                                    Enter OTP
                                </label>
                                <input
                                    type="text"
                                    id="otp"
                                    maxLength="6"
                                    value={formData.otp}
                                    onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                                    placeholder="Enter 6-digit OTP"
                                    className={errors.otp ? 'error' : ''}
                                />
                                {errors.otp && <span className="error-message">{errors.otp}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">
                                    <i className="fas fa-lock"></i>
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Enter new password"
                                    className={errors.password ? 'error' : ''}
                                />
                                {errors.password && <span className="error-message">{errors.password}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword">
                                    <i className="fas fa-lock"></i>
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    placeholder="Confirm new password"
                                    className={errors.confirmPassword ? 'error' : ''}
                                />
                                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                            </div>

                            <button type="submit" className="auth-submit" disabled={isLoading}>
                                {isLoading ? 'Resetting...' : 'Reset Password'}
                            </button>

                            <div className="auth-footer">
                                <button type="button" onClick={() => setStep(1)} className="text-btn">
                                    Wrong Email? Try Again
                                </button>
                            </div>
                        </form>
                    )}

                    {step === 3 && (
                        <div className="success-message">
                            <div className="success-icon">
                                <i className="fas fa-check-circle"></i>
                            </div>
                            <p>Your password has been successfully changed!</p>
                            <button
                                className="auth-submit"
                                onClick={() => navigate('/login')}
                            >
                                Proceed to Login
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default ForgotPassword;
