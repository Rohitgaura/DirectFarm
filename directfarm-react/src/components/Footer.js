
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const location = useLocation();
  const navigate = useNavigate();

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
            <p>Empowering farmers through technology and direct market access.</p>
            <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook"></i></a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-twitter"></i></a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin"></i></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a>
            </div>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><button onClick={() => handleQuickLink('/', 'home')} className="footer-link">Home</button></li>
              <li><button onClick={() => handleQuickLink('/', 'highlights')} className="footer-link">Highlights</button></li>
              <li><button onClick={() => handleQuickLink('/', 'about-summary')} className="footer-link">About Summary</button></li>
              <li><button onClick={() => handleQuickLink('/', 'impact')} className="footer-link">Our Impact</button></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p><i className="fas fa-envelope"></i> info@directfarm.com</p>
            <p><i className="fas fa-phone"></i> +91 98765 43210</p>
            <p><i className="fas fa-map-marker-alt"></i> Patna, Bihar, India</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 DirectFarm. All rights reserved.</p>
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
