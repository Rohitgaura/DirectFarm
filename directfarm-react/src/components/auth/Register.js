import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiService from '../../services/api';
import '../../styles/Auth.css';
import '../../styles/RegistrationConfirmation.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    userType: 'farmer',
    password: '',
    confirmPassword: '',
    experienceYears: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // OTP Verification State
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [registrationId, setRegistrationId] = useState(null);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [emailVerified, setEmailVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpError, setOtpError] = useState('');
  const otpInputRefs = useRef([]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.userType === 'farmer') {
      if (!formData.experienceYears) {
        newErrors.experienceYears = 'Experience years is required for farmers';
      } else if (parseInt(formData.experienceYears) < 0 || parseInt(formData.experienceYears) > 50) {
        newErrors.experienceYears = 'Experience years must be between 0 and 50';
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const errorMessages = Object.values(newErrors).join(', ');
      toast.error(`Please fix the following errors: ${errorMessages}`, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleReviewRegistration = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setShowConfirmation(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToEdit = () => {
    setShowConfirmation(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToConfirmation = () => {
    setShowOtpVerification(false);
    setOtpDigits(['', '', '', '', '', '']);
    setOtpError('');
    setEmailVerified(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 1: Initiate registration — send OTP
  const handleInitiateRegistration = async () => {
    setIsLoading(true);

    try {
      const userData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.userType,
      };

      if (formData.userType === 'farmer') {
        userData.experienceYears = formData.experienceYears;
      }

      const response = await apiService.initiateRegistration(userData);

      if (response.success) {
        setRegistrationId(response.data.registrationId);
        setMaskedEmail(response.data.email);
        setShowConfirmation(false);
        setShowOtpVerification(true);
        setResendCooldown(60);
        toast.success('Verification code sent to your email!', {
          position: "top-right",
          autoClose: 3000,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Registration initiation failed:', error);
      let errorMessage = 'Failed to send verification code. Please try again.';
      if (error.message) errorMessage = error.message;
      if (errorMessage.includes('already exists')) {
        toast.error('Email already registered. Please use a different email or try logging in.', {
          position: "top-right", autoClose: 3000,
        });
      } else {
        toast.error(errorMessage, { position: "top-right", autoClose: 3000 });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // OTP digit input handler
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only digits
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1); // Take last digit
    setOtpDigits(newDigits);
    setOtpError('');

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const newDigits = pasted.split('');
      setOtpDigits(newDigits);
      otpInputRefs.current[5]?.focus();
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = useCallback(async () => {
    const otp = otpDigits.join('');
    if (otp.length !== 6) {
      setOtpError('Please enter all 6 digits');
      return;
    }

    setIsVerifying(true);
    setOtpError('');

    try {
      const response = await apiService.verifyRegistrationOtp({
        registrationId,
        emailOtp: otp
      });

      if (response.success) {
        setEmailVerified(true);
        toast.success('Email verified successfully! 🎉', {
          position: "top-right", autoClose: 2000,
        });
      }
    } catch (error) {
      console.error('OTP verification failed:', error);
      setOtpError(error.message || 'Invalid OTP. Please try again.');
      setOtpDigits(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  }, [otpDigits, registrationId]);

  // Auto-verify when all 6 digits are entered
  useEffect(() => {
    if (otpDigits.every(d => d !== '') && !emailVerified && !isVerifying) {
      handleVerifyOtp();
    }
  }, [otpDigits, emailVerified, isVerifying, handleVerifyOtp]);

  // Step 3: Confirm Registration
  const handleConfirmRegistration = async () => {
    if (!emailVerified) {
      toast.error('Please verify your email first', { position: "top-right" });
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiService.confirmRegistration(registrationId);

      if (response.success) {
        toast.success('🎉 Registration successful! Welcome to DirectFarm!', {
          position: "top-right",
          autoClose: 2000,
        });
        setTimeout(() => navigate('/login'), 1500);
      }
    } catch (error) {
      console.error('Registration confirmation failed:', error);
      toast.error(error.message || 'Registration failed. Please try again.', {
        position: "top-right", autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;

    try {
      const response = await apiService.resendRegistrationOtp(registrationId);
      if (response.success) {
        setResendCooldown(60);
        setOtpDigits(['', '', '', '', '', '']);
        setEmailVerified(false);
        setOtpError('');
        otpInputRefs.current[0]?.focus();
        toast.success('New verification code sent!', {
          position: "top-right", autoClose: 2000,
        });
      }
    } catch (error) {
      console.error('Resend OTP failed:', error);
      if (error.message?.includes('expired') || error.message?.includes('not found')) {
        toast.error('Registration expired. Please start over.', { position: "top-right" });
        setShowOtpVerification(false);
        setShowConfirmation(false);
      } else {
        toast.error(error.message || 'Failed to resend code', { position: "top-right" });
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="auth-overlay"></div>
      </div>

      <div className="auth-container">
        <motion.div
          className="auth-card register-card"
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
            <h1>{showOtpVerification ? 'Verify Your Email' : 'Join DirectFarm'}</h1>
            <p>{showOtpVerification ? 'Enter the verification code sent to your email' : 'Create your account and start your journey'}</p>
          </div>

          <AnimatePresence mode="wait">
            {showOtpVerification ? (
              /* ===== OTP VERIFICATION VIEW ===== */
              <motion.div
                key="otp-verification"
                className="otp-verification-view"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                {/* Email Icon & Info */}
                <motion.div
                  className="otp-email-info"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className={`otp-icon-circle ${emailVerified ? 'verified' : ''}`}>
                    <i className={emailVerified ? 'fas fa-check' : 'fas fa-envelope'}></i>
                  </div>
                  <h3>{emailVerified ? 'Email Verified!' : 'Check Your Email'}</h3>
                  <p>
                    {emailVerified
                      ? 'Your email has been successfully verified'
                      : <>We sent a 6-digit code to <strong>{maskedEmail}</strong></>
                    }
                  </p>
                </motion.div>

                {/* OTP Input Boxes */}
                {!emailVerified && (
                  <motion.div
                    className="otp-input-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="otp-input-boxes" onPaste={handleOtpPaste}>
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={el => otpInputRefs.current[idx] = el}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className={`otp-box ${digit ? 'filled' : ''} ${otpError ? 'error' : ''}`}
                          autoFocus={idx === 0}
                          disabled={isVerifying}
                        />
                      ))}
                    </div>

                    {otpError && (
                      <motion.p
                        className="otp-error-message"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <i className="fas fa-exclamation-circle"></i> {otpError}
                      </motion.p>
                    )}

                    {isVerifying && (
                      <div className="otp-verifying">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <i className="fas fa-spinner"></i>
                        </motion.div>
                        <span>Verifying...</span>
                      </div>
                    )}

                    {/* Resend OTP */}
                    <div className="otp-resend-section">
                      <p>Didn't receive the code?</p>
                      {resendCooldown > 0 ? (
                        <span className="resend-timer">
                          Resend in <strong>{resendCooldown}s</strong>
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="resend-btn"
                          onClick={handleResendOtp}
                        >
                          <i className="fas fa-redo"></i> Resend Code
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Success animation when verified */}
                {emailVerified && (
                  <motion.div
                    className="otp-success-section"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, type: "spring" }}
                  >
                    <div className="otp-success-checkmark">
                      <svg viewBox="0 0 52 52" className="checkmark-svg">
                        <circle cx="26" cy="26" r="25" fill="none" className="checkmark-circle" />
                        <path fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" className="checkmark-check" />
                      </svg>
                    </div>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="otp-actions">
                  <motion.button
                    type="button"
                    className="back-btn"
                    onClick={handleBackToConfirmation}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <i className="fas fa-arrow-left"></i>
                    Back
                  </motion.button>
                  <motion.button
                    type="button"
                    className={`confirm-btn ${emailVerified ? 'ready' : 'disabled'}`}
                    onClick={handleConfirmRegistration}
                    disabled={!emailVerified || isLoading}
                    whileHover={emailVerified ? { scale: 1.02 } : {}}
                    whileTap={emailVerified ? { scale: 0.98 } : {}}
                  >
                    {isLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check-circle"></i>
                        Complete Registration
                      </>
                    )}
                  </motion.button>
                </div>

                {/* Timer info */}
                <p className="otp-timer-info">
                  <i className="fas fa-clock"></i> Verification code expires in 10 minutes
                </p>
              </motion.div>

            ) : showConfirmation ? (
              /* ===== CONFIRMATION VIEW ===== */
              <motion.div
                key="confirmation"
                className="confirmation-view"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                <div className="confirmation-header">
                  <h2>Review Your Information</h2>
                  <p>Please confirm your details before we verify your email</p>
                </div>

                {/* Role Badge */}
                <motion.div
                  className={`role-badge-large ${formData.userType}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <i className={formData.userType === 'farmer' ? 'fas fa-tractor' : 'fas fa-shopping-cart'}></i>
                  <h3>Registering as {formData.userType === 'farmer' ? 'Farmer' : 'Buyer'}</h3>
                  <p>{formData.userType === 'farmer' ? 'Sell your produce directly' : 'Buy fresh from farmers'}</p>
                </motion.div>

                {/* User Details */}
                <div className="confirmation-details">
                  <div className="detail-section">
                    <h4><i className="fas fa-user"></i> Personal Information</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">Name:</span>
                        <span className="detail-value">{formData.firstName} {formData.lastName}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Email:</span>
                        <span className="detail-value">{formData.email}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Phone:</span>
                        <span className="detail-value">{formData.phone}</span>
                      </div>
                      {formData.userType === 'farmer' && formData.experienceYears && (
                        <div className="detail-item">
                          <span className="detail-label">Experience:</span>
                          <span className="detail-value">{formData.experienceYears} years</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Verification Notice */}
                <motion.div
                  className="verification-notice"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <i className="fas fa-shield-alt"></i>
                  <div>
                    <strong>Email Verification Required</strong>
                    <p>We'll send a verification code to <strong>{formData.email}</strong> to confirm your identity.</p>
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <div className="confirmation-actions">
                  <motion.button
                    type="button"
                    className="back-btn"
                    onClick={handleBackToEdit}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <i className="fas fa-arrow-left"></i>
                    Back to Edit
                  </motion.button>
                  <motion.button
                    type="button"
                    className="confirm-btn"
                    onClick={handleInitiateRegistration}
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Sending Code...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane"></i>
                        Send Verification Code
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>

            ) : (
              /* ===== REGISTRATION FORM ===== */
              <motion.form
                key="form"
                onSubmit={handleReviewRegistration}
                className="auth-form"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.5 }}
              >
                <div className="form-row">
                  <motion.div
                    className="form-group"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label htmlFor="firstName">
                      <i className="fas fa-user"></i>
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={errors.firstName ? 'error' : ''}
                      placeholder="Enter your first name"
                    />
                    {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                  </motion.div>

                  <motion.div
                    className="form-group"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label htmlFor="lastName">
                      <i className="fas fa-user"></i>
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={errors.lastName ? 'error' : ''}
                      placeholder="Enter your last name"
                    />
                    {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                  </motion.div>
                </div>

                <motion.div
                  className="form-group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label htmlFor="email">
                    <i className="fas fa-envelope"></i>
                    Email Address
                  </label>
                  <div className="email-input-container">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`${errors.email ? 'error' : ''} ${formData.email && !errors.email ? 'valid' : ''}`}
                      placeholder="Enter your email"
                    />
                    {formData.email && !errors.email && (
                      <i className="fas fa-check-circle email-valid-icon"></i>
                    )}
                    {errors.email && errors.email.includes('already registered') && (
                      <i className="fas fa-exclamation-circle email-error-icon"></i>
                    )}
                  </div>
                  {errors.email && <span className="error-message">{errors.email}</span>}
                  {formData.email && !errors.email && (
                    <span className="success-message">
                      <i className="fas fa-check"></i> Email is available
                    </span>
                  )}
                </motion.div>

                <motion.div
                  className="form-group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
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
                    className={errors.phone ? 'error' : ''}
                    placeholder="Enter your phone number"
                  />
                  {errors.phone && <span className="error-message">{errors.phone}</span>}
                </motion.div>

                <motion.div
                  className="form-group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <label htmlFor="userType">
                    <i className="fas fa-users"></i>
                    I am a
                  </label>
                  <select
                    id="userType"
                    name="userType"
                    value={formData.userType}
                    onChange={handleChange}
                  >
                    <option value="farmer">Farmer</option>
                    <option value="buyer">Buyer/Retailer</option>
                    <option value="wholesaler">Wholesaler</option>
                    <option value="logistics">Logistics Partner</option>
                  </select>
                </motion.div>

                {/* Experience Years Field - Only for Farmers */}
                {formData.userType === 'farmer' && (
                  <motion.div
                    className="form-group"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.65 }}
                  >
                    <label htmlFor="experienceYears">
                      <i className="fas fa-calendar-alt"></i>
                      Years of Farming Experience
                    </label>
                    <input
                      type="number"
                      id="experienceYears"
                      name="experienceYears"
                      value={formData.experienceYears}
                      onChange={handleChange}
                      className={errors.experienceYears ? 'error' : ''}
                      placeholder="Enter years of farming experience"
                      min="0"
                      max="50"
                    />
                    {errors.experienceYears && <span className="error-message">{errors.experienceYears}</span>}
                  </motion.div>
                )}

                <motion.div
                  className="form-group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <label htmlFor="password">
                    <i className="fas fa-lock"></i>
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? 'error' : ''}
                    placeholder="Create a strong password"
                  />
                  {errors.password && <span className="error-message">{errors.password}</span>}
                </motion.div>

                <motion.div
                  className="form-group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <label htmlFor="confirmPassword">
                    <i className="fas fa-lock"></i>
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={errors.confirmPassword ? 'error' : ''}
                    placeholder="Confirm your password"
                  />
                  {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                </motion.div>

                <motion.div
                  className="form-options"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <label className="checkbox-container">
                    <input type="checkbox" required />
                    <span className="checkmark"></span>
                    I agree to the{' '}
                    <Link to="/terms" className="terms-link">Terms of Service</Link> and{' '}
                    <Link to="/privacy" className="terms-link">Privacy Policy</Link>
                  </label>
                </motion.div>

                <motion.button
                  type="submit"
                  className="auth-submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 }}
                >
                  {isLoading ? (
                    <motion.div
                      className="loading-spinner"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <i className="fas fa-spinner"></i>
                    </motion.div>
                  ) : (
                    <>
                      <i className="fas fa-user-plus"></i>
                      Create Account
                    </>
                  )}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

          <motion.div
            className="auth-footer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Sign in here
              </Link>
            </p>
          </motion.div>

          <motion.div
            className="social-login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <p>Or sign up with</p>
            <div className="social-buttons">
              <motion.button
                className="social-btn google"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <i className="fab fa-google"></i>
                Google
              </motion.button>
              <motion.button
                className="social-btn facebook"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <i className="fab fa-facebook-f"></i>
                Facebook
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
