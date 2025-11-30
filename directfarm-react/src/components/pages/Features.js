import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import '../../styles/Features.css';

const Features = () => {
  const farmerFeatures = [
    {
      icon: 'fas fa-mobile-alt',
      title: 'Easy Crop Listing',
      description: 'Simple interface to list your produce with photos, descriptions, and pricing'
    },
    {
      icon: 'fas fa-chart-line',
      title: 'Real-time Market Prices',
      description: 'Get live updates on market prices to make informed selling decisions'
    },
    {
      icon: 'fas fa-handshake',
      title: 'Direct Buyer Connection',
      description: 'Connect directly with retailers, wholesalers, and bulk buyers'
    },
    {
      icon: 'fas fa-credit-card',
      title: 'Secure Payments',
      description: 'Receive payments directly to your bank account with full transparency'
    }
  ];

  const buyerFeatures = [
    {
      icon: 'fas fa-search',
      title: 'Advanced Search',
      description: 'Find specific crops, locations, and quality requirements easily'
    },
    {
      icon: 'fas fa-filter',
      title: 'Smart Filtering',
      description: 'Filter by price, location, quality, and delivery preferences'
    },
    {
      icon: 'fas fa-truck',
      title: 'Logistics Support',
      description: 'End-to-end transportation and delivery management'
    },
    {
      icon: 'fas fa-shield-alt',
      title: 'Quality Assurance',
      description: 'Verified farmer profiles and quality ratings system'
    }
  ];

  const platformFeatures = [
    {
      icon: 'fas fa-globe',
      title: 'Multi-language Support',
      description: 'Available in Hindi, English, and local dialects'
    },
    {
      icon: 'fas fa-wifi',
      title: 'Offline Functionality',
      description: 'Work even with poor internet connectivity'
    },
    {
      icon: 'fas fa-mobile',
      title: 'Mobile-First Design',
      description: 'Optimized for smartphones and feature phones'
    },
    {
      icon: 'fas fa-database',
      title: 'Data Analytics',
      description: 'Insights into market trends and crop performance'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="features-page">
      {/* Back to Home Button */}
      <motion.div
        className="back-to-home"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container">
          <Link to="/" className="back-btn">
            <i className="fas fa-arrow-left"></i>
            Back to Home
          </Link>
        </div>
      </motion.div>

      {/* Page Header */}
      <motion.section
        className="page-header"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="container">
          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Platform Features
          </motion.h1>
          <motion.p
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Discover the powerful tools and capabilities that make DirectFarm the ultimate agricultural marketplace
          </motion.p>
        </div>
      </motion.section>

      {/* Hero Features Section */}
      <motion.section
        className="hero-features"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="container">
          <motion.h2
            className="section-title"
            variants={itemVariants}
          >
            Why Choose DirectFarm?
          </motion.h2>
          <div className="hero-features-grid">
            <motion.div
              className="hero-feature-card"
              variants={itemVariants}
              whileHover={{
                y: -15,
                scale: 1.05,
                transition: { duration: 0.3 }
              }}
            >
              <div className="hero-feature-icon">
                <i className="fas fa-rocket"></i>
              </div>
              <h3>Lightning Fast</h3>
              <p>Complete transactions in minutes, not days. Our streamlined process ensures quick and efficient trading.</p>
            </motion.div>
            <motion.div
              className="hero-feature-card"
              variants={itemVariants}
              whileHover={{
                y: -15,
                scale: 1.05,
                transition: { duration: 0.3 }
              }}
            >
              <div className="hero-feature-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h3>100% Secure</h3>
              <p>Bank-grade security with encrypted transactions and verified user profiles for safe trading.</p>
            </motion.div>
            <motion.div
              className="hero-feature-card"
              variants={itemVariants}
              whileHover={{
                y: -15,
                scale: 1.05,
                transition: { duration: 0.3 }
              }}
            >
              <div className="hero-feature-icon">
                <i className="fas fa-users"></i>
              </div>
              <h3>Community Driven</h3>
              <p>Built by farmers, for farmers. Our platform grows with community feedback and needs.</p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Farmer Features Section */}
      <motion.section
        className="farmer-features"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="container">
          <motion.h2
            className="section-title"
            variants={itemVariants}
          >
            For Farmers
          </motion.h2>
          <motion.p
            className="section-subtitle"
            variants={itemVariants}
          >
            Everything you need to sell your produce directly to buyers
          </motion.p>
          <div className="features-grid">
            {farmerFeatures.map((feature, index) => (
              <motion.div
                key={index}
                className="feature-card farmer-card"
                variants={itemVariants}
                whileHover={{
                  y: -10,
                  scale: 1.03,
                  transition: { duration: 0.3 }
                }}
              >
                <div className="feature-icon">
                  <i className={feature.icon}></i>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Buyer Features Section */}
      <motion.section
        className="buyer-features"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="container">
          <motion.h2
            className="section-title"
            variants={itemVariants}
          >
            For Buyers
          </motion.h2>
          <motion.p
            className="section-subtitle"
            variants={itemVariants}
          >
            Powerful tools to find and purchase quality produce directly from farmers
          </motion.p>
          <div className="features-grid">
            {buyerFeatures.map((feature, index) => (
              <motion.div
                key={index}
                className="feature-card buyer-card"
                variants={itemVariants}
                whileHover={{
                  y: -10,
                  scale: 1.03,
                  transition: { duration: 0.3 }
                }}
              >
                <div className="feature-icon">
                  <i className={feature.icon}></i>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Platform Features Section */}
      <motion.section
        className="platform-features"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="container">
          <motion.h2
            className="section-title"
            variants={itemVariants}
          >
            Platform Capabilities
          </motion.h2>
          <motion.p
            className="section-subtitle"
            variants={itemVariants}
          >
            Advanced technology features that make DirectFarm accessible to everyone
          </motion.p>
          <div className="features-grid">
            {platformFeatures.map((feature, index) => (
              <motion.div
                key={index}
                className="feature-card platform-card"
                variants={itemVariants}
                whileHover={{
                  y: -10,
                  scale: 1.03,
                  transition: { duration: 0.3 }
                }}
              >
                <div className="feature-icon">
                  <i className={feature.icon}></i>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="cta-section"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="container">
          <motion.div
            className="cta-content"
            variants={itemVariants}
          >
            <h2>Ready to Get Started?</h2>
            <p>Join thousands of farmers and buyers who are already using DirectFarm</p>
            <div className="cta-buttons">
              <motion.button
                className="btn btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <i className="fas fa-user-farmer"></i>
                Join as Farmer
              </motion.button>
              <motion.button
                className="btn btn-secondary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <i className="fas fa-store"></i>
                Join as Buyer
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default Features;
