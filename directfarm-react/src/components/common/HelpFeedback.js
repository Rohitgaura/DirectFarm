import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiService from '../../services/api';
import authUtils from '../../utils/auth';
import '../../styles/HelpFeedback.css';

const HelpFeedback = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    type: 'feedback',
    subject: '',
    message: '',
    email: '',
    phone: '',
    priority: 'medium',
    name: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const currentUser = authUtils.getUser();
    setUser(currentUser);
  }, []);

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

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    if (!user) {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      const submissionData = {
        ...formData,
        user: user?._id || user?.id
      };

      const response = await apiService.submitFeedback(submissionData);

      if (response.success) {
        setSubmitSuccess(true);
        toast.success('Thank you for your feedback!');

        // Reset form after delay
        setTimeout(() => {
          setSubmitSuccess(false);
          setFormData({
            type: 'feedback',
            subject: '',
            message: '',
            email: '',
            phone: '',
            priority: 'medium',
            name: ''
          });
        }, 3000);
      } else {
        throw new Error(response.message || 'Submission failed');
      }

    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error(error.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="help-page-container">
      <motion.div
        className="help-content-wrapper"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="page-header">
          <h1>
            <i className="fas fa-headset"></i>
            Help & Feedback
          </h1>
          <p>We'd love to hear from you! Send us your feedback, complaints, or suggestions.</p>
        </div>

        <div className="content-body">
          {submitSuccess ? (
            <motion.div
              className="success-message-container"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="success-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <h2>Feedback Received!</h2>
              <p>Thank you for helping us improve DirectFarm. We will review your message shortly.</p>
              <button
                className="submit-another-btn"
                onClick={() => {
                  setSubmitSuccess(false);
                  setFormData({
                    type: 'feedback',
                    subject: '',
                    message: '',
                    email: '',
                    phone: '',
                    priority: 'medium',
                    name: ''
                  });
                }}
              >
                Submit Another
              </button>
            </motion.div>
          ) : (
            <>
              <div className="help-tabs">
                {['feedback', 'complaint', 'suggestion'].map(type => (
                  <button
                    key={type}
                    className={`tab-btn ${formData.type === type ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, type }))}
                  >
                    <i className={`fas fa-${type === 'feedback' ? 'comment-alt' : type === 'complaint' ? 'exclamation-circle' : 'lightbulb'}`}></i>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="feedback-form">
                <div className="form-group full-width">
                  <label htmlFor="priority">Priority Level</label>
                  <div className="priority-options">
                    {['low', 'medium', 'high', 'urgent'].map(p => (
                      <div
                        key={p}
                        className={`priority-chip ${formData.priority === p ? 'selected' : ''} ${p}`}
                        onClick={() => setFormData(prev => ({ ...prev, priority: p }))}
                      >
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={errors.subject ? 'error' : ''}
                    placeholder={`Enter ${formData.type} subject`}
                  />
                  {errors.subject && <span className="error-message">{errors.subject}</span>}
                </div>

                {/* Conditional Render: Contact Info for Guests */}
                {!user && (
                  <div className="guest-info-grid">
                    <div className="form-group">
                      <label htmlFor="name">Your Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your name"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Email <span className="required">*</span></label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={errors.email ? 'error' : ''}
                        placeholder="Enter your email"
                      />
                      {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="phone">Phone <span className="required">*</span></label>
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
                    </div>
                  </div>
                )}

                <div className="form-group full-width">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className={errors.message ? 'error' : ''}
                    placeholder={`Please describe your ${formData.type} in detail...`}
                    rows="5"
                  />
                  {errors.message && <span className="error-message">{errors.message}</span>}
                </div>

                <div className="form-actions">
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="submit-btn"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isSubmitting ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i> Sending...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane"></i> Submit
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </>
          )}

          <div className="help-info">
            <div className="contact-card">
              <i className="fas fa-envelope"></i>
              <div>
                <h4>Email Support</h4>
                <p>support@directfarm.com</p>
              </div>
            </div>
            <div className="contact-card">
              <i className="fas fa-phone-alt"></i>
              <div>
                <h4>Phone Support</h4>
                <p>+91 98765 43210</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HelpFeedback;
