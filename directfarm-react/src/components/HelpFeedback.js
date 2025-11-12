import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './HelpFeedback.css';

const HelpFeedback = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    type: 'feedback',
    subject: '',
    message: '',
    email: '',
    priority: 'medium'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
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
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
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
      // Simulate API call - in real app, this would send to backend
      console.log('Submitting feedback:', formData);
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Thank you for your feedback! We will get back to you soon.', {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Reset form
      setFormData({
        type: 'feedback',
        subject: '',
        message: '',
        email: '',
        priority: 'medium'
      });
      
      // Close modal
      onClose();
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      type: 'feedback',
      subject: '',
      message: '',
      email: '',
      priority: 'medium'
    });
    setErrors({});
    onClose();
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Don't render if not open
  if (!isOpen) return null;

  // Render modal using React Portal to document.body for proper z-index
  return createPortal(
    <div className="help-feedback-overlay" onClick={handleClose}>
      <motion.div 
        className="help-feedback-modal"
        initial={{ opacity: 0, y: -50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>
            <i className="fas fa-question-circle"></i>
            Help & Feedback
          </h2>
          <button className="close-btn" onClick={handleClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-content">
          <div className="help-tabs">
            <button 
              className={`tab-btn ${formData.type === 'feedback' ? 'active' : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, type: 'feedback' }))}
            >
              <i className="fas fa-comment-alt"></i>
              Feedback
            </button>
            <button 
              className={`tab-btn ${formData.type === 'complaint' ? 'active' : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, type: 'complaint' }))}
            >
              <i className="fas fa-exclamation-triangle"></i>
              Complaint
            </button>
            <button 
              className={`tab-btn ${formData.type === 'suggestion' ? 'active' : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, type: 'suggestion' }))}
            >
              <i className="fas fa-lightbulb"></i>
              Suggestion
            </button>
          </div>

          <form onSubmit={handleSubmit} className="feedback-form">
            <div className="form-group">
              <label htmlFor="priority">
                <i className="fas fa-flag"></i>
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className={errors.priority ? 'error' : ''}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              {errors.priority && <span className="error-message">{errors.priority}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="subject">
                <i className="fas fa-tag"></i>
                Subject
              </label>
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
                className={errors.email ? 'error' : ''}
                placeholder="Enter your email address"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="message">
                <i className="fas fa-edit"></i>
                {formData.type === 'feedback' ? 'Feedback' : 
                 formData.type === 'complaint' ? 'Complaint Details' : 
                 'Suggestion Details'}
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                className={errors.message ? 'error' : ''}
                placeholder={`Please describe your ${formData.type} in detail...`}
                rows="6"
              />
              {errors.message && <span className="error-message">{errors.message}</span>}
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={handleClose}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="submit-btn"
              >
                {isSubmitting ? (
                  <motion.div
                    className="loading-spinner"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <i className="fas fa-spinner"></i>
                  </motion.div>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i>
                    Submit {formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="help-info">
            <h3>
              <i className="fas fa-info-circle"></i>
              Need Immediate Help?
            </h3>
            <div className="contact-info">
              <div className="contact-item">
                <i className="fas fa-phone"></i>
                <span>Call us: +91 9876543210</span>
              </div>
              <div className="contact-item">
                <i className="fas fa-envelope"></i>
                <span>Email: support@directfarm.com</span>
              </div>
              <div className="contact-item">
                <i className="fas fa-clock"></i>
                <span>Available: 9 AM - 6 PM (Mon-Fri)</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

export default HelpFeedback;
