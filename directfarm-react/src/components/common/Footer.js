
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import socketService from '../../services/socket';
import { useLanguage } from '../../context/LanguageContext';
import '../../styles/Footer.css';

const Footer = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [liveUsers, setLiveUsers] = useState(1);

  useEffect(() => {
    // Connect to Socket.io service
    const socket = socketService.connect();

    if (socket) {
      // Listen for the activeUsersCount broadcast event
      socket.on('activeUsersCount', (count) => {
        setLiveUsers(count);
      });

      // Request immediate count in case we missed the broadcast
      socket.emit('getActiveUsersCount');
    }

    return () => {
      if (socket) {
        socket.off('activeUsersCount');
      }
    };
  }, []);

  const scrollToSection = (sectionId) => {
    if (location.pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  };

  const handleQuickLink = (path, sectionId) => {
    if (path === '/') {
      if (location.pathname === '/') {
        // If already on home page, scroll to section
        scrollToSection(sectionId);
      } else {
        // If on another page, navigate to home and then scroll
        navigate('/');
        setTimeout(() => {
          scrollToSection(sectionId);
        }, 100);
      }
    } else {
      // Navigate to other pages
      window.scrollTo(0, 0);
      navigate(path);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>DirectFarm</h3>
            <p>{t('footer.tagline')}</p>
            <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook"></i></a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-twitter"></i></a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin"></i></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a>
            </div>
          </div>
          <div className="footer-section">
            <h4>{t('footer.quickLinks')}</h4>
            <ul>
              <li><button onClick={() => handleQuickLink('/', 'home')} className="footer-link">{t('footer.home')}</button></li>
              <li><button onClick={() => handleQuickLink('/', 'highlights')} className="footer-link">{t('footer.highlights')}</button></li>
              <li><button onClick={() => handleQuickLink('/', 'about-summary')} className="footer-link">{t('footer.aboutSummary')}</button></li>
              <li><button onClick={() => handleQuickLink('/', 'impact')} className="footer-link">{t('footer.ourImpact')}</button></li>
              <li><button onClick={() => handleQuickLink('/career', null)} className="footer-link">{t('footer.careers')}</button></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>{t('footer.contact')}</h4>
            <p><i className="fas fa-envelope"></i> info@directfarm.com</p>
            <p><i className="fas fa-phone"></i> +91 98765 43210</p>
            <p><i className="fas fa-map-marker-alt"></i> {t('footer.address')}</p>
          </div>
          <div className="footer-section">
            <h4>{t('footer.policies')}</h4>
            <ul>
              <li><button onClick={() => handleQuickLink('/terms-conditions', null)} className="footer-link">{t('footer.termsConditions')}</button></li>
              <li><button onClick={() => handleQuickLink('/privacy-policy', null)} className="footer-link">{t('footer.privacyPolicy')}</button></li>
              <li><button onClick={() => handleQuickLink('/refund-policy', null)} className="footer-link">{t('footer.refundPolicy')}</button></li>
              <li><button onClick={() => handleQuickLink('/delivery-policy', null)} className="footer-link">{t('footer.deliveryPolicy')}</button></li>
              <li><button onClick={() => handleQuickLink('/data-protection-policy', null)} className="footer-link">{t('footer.dataProtection')}</button></li>
              <li><button onClick={() => handleQuickLink('/seller-verification-policy', null)} className="footer-link">{t('footer.sellerVerification')}</button></li>
              <li><button onClick={() => handleQuickLink('/disclaimer-policy', null)} className="footer-link">{t('footer.disclaimer')}</button></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 DirectFarm. {t('footer.rights')}</p>
          <div className="live-users-footer">
            <span className="live-pulse-dot"></span>
            <span className="live-users-text">
              <strong>{liveUsers}</strong> {liveUsers === 1 ? 'user' : 'users'} online now
            </span>
          </div>
          <button onClick={scrollToTop} className="back-to-top">
            <i className="fas fa-arrow-up"></i>
            Back to Top
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
