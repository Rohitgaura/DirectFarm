import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiService from '../../services/api';
import authUtils from '../../utils/auth';
import { useLanguage } from '../../context/LanguageContext';
import '../../styles/HelpFeedback.css';
import { ComplaintTrackingModal } from './ComplaintTrackingModal';

const HelpFeedback = () => {
  const { t, language } = useLanguage();
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

  const getTabLabel = (type) => {
    if (type === 'feedback') return t('help.feedbackTab');
    if (type === 'complaint') return t('help.complaintTab');
    if (type === 'suggestion') return t('help.suggestionTab');
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getPriorityLabel = (p) => {
    if (p === 'low') return t('help.lowPriority');
    if (p === 'medium') return t('help.mediumPriority');
    if (p === 'high') return t('help.highPriority');
    if (p === 'urgent') return t('help.urgentPriority');
    return p.charAt(0).toUpperCase() + p.slice(1);
  };
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [lastRequestId, setLastRequestId] = useState(null);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);

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
      newErrors.subject = t('help.errors.subjectRequired');
    }

    if (!formData.message.trim()) {
      newErrors.message = t('help.errors.messageRequired');
    } else if (formData.message.trim().length < 10) {
      newErrors.message = t('help.errors.messageLength');
    }

    if (!user) {
      if (!formData.email.trim()) {
        newErrors.email = t('help.errors.emailRequired');
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = t('help.errors.emailInvalid');
      }
      if (!formData.phone.trim()) {
        newErrors.phone = t('help.errors.phoneRequired');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(t('help.errors.fixErrors'));
      return;
    }

    setIsSubmitting(true);
    setLastRequestId(null);

    try {
      const submissionData = {
        ...formData,
        user: user?._id || user?.id,
        // Ensure description field matches what backend expects for complaints
        description: formData.message
      };

      let response;
      if (formData.type === 'complaint') {
        response = await apiService.submitComplaint(submissionData);
      } else {
        response = await apiService.submitFeedback(submissionData);
      }

      if (response.success || (formData.type === 'complaint' && response.requestId)) {
        setSubmitSuccess(true);

        if (formData.type === 'complaint' && response.requestId) {
          setLastRequestId(response.requestId);
          toast.success(`${t('help.complaintSubmitted')} ID: ${response.requestId}`);
        } else {
          toast.success(t('help.thankYouFeedback'));
        }

        // Reset form after delay (longer delay if there is a request ID to read)
        setTimeout(() => {
          setSubmitSuccess(false);
          setLastRequestId(null);
          setFormData({
            type: 'feedback', // Reset to default
            subject: '',
            message: '',
            email: '',
            phone: '',
            priority: 'medium',
            name: ''
          });
        }, 8000);
      } else {
        throw new Error(response.message || t('help.errors.submitFailed'));
      }

    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(error.message || t('help.errors.submitFailed'));
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
        <div className="page-header d-flex justify-content-between align-items-center">
          <div>
            <h1>
              <i className="fas fa-headset"></i>
              {t('help.title')}
            </h1>
            <p>{t('help.subtitle')}</p>
          </div>
          <button
            className="btn btn-outline-primary"
            onClick={() => setIsTrackingModalOpen(true)}
          >
            {t('help.trackComplaintBtn')}
          </button>
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
              <h2>{lastRequestId ? t('help.complaintSubmitted') : t('help.feedbackReceived')}</h2>

              {lastRequestId && (
                <div className="alert alert-info my-3">
                  <strong>{t('help.requestIdIs')} {lastRequestId}</strong>
                  <p className="mb-0 mt-1 small">{t('help.saveRequestId')}</p>
                </div>
              )}

              <p>{lastRequestId ? t('help.processComplaintSoon') : t('help.thankYouFeedback')}</p>

              <button
                className="submit-another-btn"
                onClick={() => {
                  setSubmitSuccess(false);
                  setLastRequestId(null);
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
                {t('help.submitAnother')}
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
                    {getTabLabel(type)}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="feedback-form">
                <div className="form-group full-width">
                  <label htmlFor="priority">{t('help.priorityLevel')}</label>
                  <div className="priority-options">
                    {['low', 'medium', 'high', 'urgent'].map(p => (
                      <div
                        key={p}
                        className={`priority-chip ${formData.priority === p ? 'selected' : ''} ${p}`}
                        onClick={() => setFormData(prev => ({ ...prev, priority: p }))}
                      >
                        {getPriorityLabel(p)}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="subject">{t('help.subject')}</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={errors.subject ? 'error' : ''}
                    placeholder={
                      language === 'hi'
                        ? (formData.type === 'complaint' ? 'शिकायत का विषय दर्ज करें' : formData.type === 'suggestion' ? 'सुझाव का विषय दर्ज करें' : 'प्रतिक्रिया का विषय दर्ज करें')
                        : `Enter ${formData.type} subject`
                    }
                  />
                  {errors.subject && <span className="error-message">{errors.subject}</span>}
                </div>

                {/* Conditional Render: Contact Info for Guests */}
                {!user && (
                  <div className="guest-info-grid">
                    <div className="form-group">
                      <label htmlFor="name">{t('help.yourName')}</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder={t('help.namePlaceholder')}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">{t('help.email')} <span className="required">*</span></label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={errors.email ? 'error' : ''}
                        placeholder={t('help.emailPlaceholder')}
                      />
                      {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="phone">{t('help.phone')} <span className="required">*</span></label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={errors.phone ? 'error' : ''}
                        placeholder={t('help.phonePlaceholder')}
                      />
                      {errors.phone && <span className="error-message">{errors.phone}</span>}
                    </div>
                  </div>
                )}

                <div className="form-group full-width">
                  <label htmlFor="message">{t('help.message')}</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className={errors.message ? 'error' : ''}
                    placeholder={
                      language === 'hi'
                        ? (formData.type === 'complaint' ? 'कृपया अपनी शिकायत का विस्तार से वर्णन करें...' : formData.type === 'suggestion' ? 'कृपया अपने सुझाव का विस्तार से वर्णन करें...' : 'कृपया अपनी प्रतिक्रिया का विस्तार से वर्णन करें...')
                        : `Please describe your ${formData.type} in detail...`
                    }
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
                        <i className="fas fa-spinner fa-spin"></i> {t('help.sending')}
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane"></i> {t('help.submit')}
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
                <h4>{t('help.emailSupport')}</h4>
                <p>support@directfarm.com</p>
              </div>
            </div>
            <div className="contact-card">
              <i className="fas fa-phone-alt"></i>
              <div>
                <h4>{t('help.phoneSupport')}</h4>
                <p>+91 98765 43210</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tracking Modal */}
      {isTrackingModalOpen && (
        <ComplaintTrackingModal
          isOpen={isTrackingModalOpen}
          onClose={() => setIsTrackingModalOpen(false)}
        />
      )}
    </div>
  );
};

export default HelpFeedback;
