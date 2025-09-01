import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Home.css';

const Home = () => {
  // Demo function to test toast notifications
  const testToasts = () => {
    toast.success('This is a success message!', {
      position: "top-right",
      autoClose: 3000,
    });
    
    setTimeout(() => {
      toast.error('This is an error message!', {
        position: "top-right",
        autoClose: 3000,
      });
    }, 1000);
    
    setTimeout(() => {
      toast.info('This is an info message!', {
        position: "top-right",
        autoClose: 3000,
      });
    }, 2000);
    
    setTimeout(() => {
      toast.warning('This is a warning message!', {
        position: "top-right",
        autoClose: 3000,
      });
    }, 3000);
  };
  const highlights = [
    {
      icon: 'fas fa-coins',
      title: 'Fair Prices for Farmers',
      description: 'Eliminate middlemen and get direct market prices for your produce'
    },
    {
      icon: 'fas fa-globe',
      title: 'Direct Market Access',
      description: 'Connect directly with retailers and wholesalers across the country'
    },
    {
      icon: 'fas fa-shield-alt',
      title: 'Transparent & Secure Payments',
      description: 'Secure payment processing with real-time tracking and transparency'
    },
    {
      icon: 'fas fa-truck',
      title: 'Logistics & Cold Storage',
      description: 'End-to-end logistics support including transportation and cold storage'
    }
  ];

  const impactMetrics = [
    {
      number: '30-50%',
      title: 'Increase in Farmer Income',
      description: 'Direct market access eliminates middlemen margins'
    },
    {
      number: '40%',
      title: 'Reduction in Food Wastage',
      description: 'Faster sales cycles and better market reach'
    },
    {
      number: '1000+',
      title: 'Farmers Connected',
      description: 'Growing network across Bihar and neighboring states'
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
    <div className="home">
      {/* Hero Section */}
      <motion.section 
        id="home"
        className="hero"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="hero-background">
          <div className="hero-overlay"></div>
        </div>
        <motion.div 
          className="hero-content"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <div className="container">
            <motion.h1 
              className="hero-title"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              Empowering Farmers, Connecting Retailers
            </motion.h1>
            <motion.p 
              className="hero-subtitle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              A digital platform that connects farmers directly to retailers, wholesalers, and bulk buyers, ensuring fair trade, transparency, and improved farmer income.
            </motion.p>
            <motion.div 
              className="hero-buttons"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/about" className="btn btn-primary">
                  <i className="fas fa-user-farmer"></i>
                  Join as Farmer
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/features" className="btn btn-secondary">
                  <i className="fas fa-store"></i>
                  Join as Buyer
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <button onClick={testToasts} className="btn btn-secondary" style={{ background: '#FF9800' }}>
                  <i className="fas fa-bell"></i>
                  Test Toasts
                </button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </motion.section>

      {/* Highlights Section */}
      <motion.section 
        id="highlights"
        className="highlights"
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
          <div className="highlights-grid">
            {highlights.map((highlight, index) => (
              <motion.div 
                key={index}
                className="highlight-card"
                variants={itemVariants}
                whileHover={{ 
                  y: -10, 
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
              >
                <div className="highlight-icon">
                  <i className={highlight.icon}></i>
                </div>
                <h3>{highlight.title}</h3>
                <p>{highlight.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* About Summary Section */}
      <motion.section 
        id="about-summary"
        className="about-summary"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="container">
          <div className="about-content">
            <motion.div 
              className="about-text"
              variants={itemVariants}
            >
              <h2>About DirectFarm</h2>
              <p>
                Farmers in Bihar face significant challenges including low income due to middlemen exploitation, 
                high food wastage from lack of market access, and limited digital literacy. DirectFarm addresses 
                these issues by creating a transparent, efficient, and equitable marketplace that connects farmers 
                directly with buyers.
              </p>
              <p>
                Our platform eliminates intermediaries, provides fair pricing, and ensures faster sales cycles, 
                resulting in increased farmer income and reduced food wastage.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/about" className="btn btn-outline">Learn More</Link>
              </motion.div>
            </motion.div>
            <motion.div 
              className="about-image"
              variants={itemVariants}
            >
              <div className="image-placeholder">
                <i className="fas fa-users"></i>
                <p>Farmers & Technology</p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Impact Section */}
      <motion.section 
        id="impact"
        className="testimonials"
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
            Our Impact
          </motion.h2>
          <div className="impact-grid">
            {impactMetrics.map((metric, index) => (
              <motion.div 
                key={index}
                className="impact-card"
                variants={itemVariants}
                whileHover={{ 
                  y: -8, 
                  scale: 1.03,
                  transition: { duration: 0.3 }
                }}
              >
                <div className="impact-number">{metric.number}</div>
                <h3>{metric.title}</h3>
                <p>{metric.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default Home;
