import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './SocialImpact.css';

const SocialImpact = () => {
  const impactMetrics = [
    {
      number: '30-50%',
      title: 'Income Increase',
      description: 'Average increase in farmer income through direct market access',
      icon: 'fas fa-chart-line'
    },
    {
      number: '40%',
      title: 'Reduced Wastage',
      description: 'Decrease in food wastage through better market access',
      icon: 'fas fa-leaf'
    },
    {
      number: '1000+',
      title: 'Farmers Connected',
      description: 'Farmers actively using the DirectFarm platform',
      icon: 'fas fa-users'
    },
    {
      number: '₹2.5Cr+',
      title: 'Value Generated',
      description: 'Total value generated for farming communities',
      icon: 'fas fa-rupee-sign'
    }
  ];

  const farmerStories = [
    {
      name: 'Ram Kumar Singh',
      location: 'Patna, Bihar',
      story: 'Before DirectFarm, I was earning only ₹15,000 per month. Now I earn ₹25,000-30,000 monthly by selling directly to retailers. My family can now afford better education for my children.',
      image: 'farmer1',
      crop: 'Vegetables',
      income: '₹30,000',
      improvement: '+100%',
      icon: 'fas fa-chart-line',
      color: '#4CAF50'
    },
    {
      name: 'Lakshmi Devi',
      location: 'Gaya, Bihar',
      story: 'DirectFarm helped me connect with buyers from other states. I now sell my organic produce at premium prices and have started training other women farmers in my village.',
      image: 'farmer2',
      crop: 'Organic Vegetables',
      income: '₹35,000',
      improvement: '+150%',
      icon: 'fas fa-seedling',
      color: '#FF9800'
    },
    {
      name: 'Mohan Prasad',
      location: 'Bhagalpur, Bihar',
      story: 'The platform eliminated middlemen who used to take 40% of my earnings. Now I get fair prices and can plan my crops better with market insights.',
      image: 'farmer3',
      crop: 'Fruits',
      income: '₹28,000',
      improvement: '+87%',
      icon: 'fas fa-apple-alt',
      color: '#E91E63'
    }
  ];

  const communityBenefits = [
    {
      icon: 'fas fa-graduation-cap',
      title: 'Education Access',
      description: 'Increased farmer income enables better education for children, breaking the cycle of poverty.'
    },
    {
      icon: 'fas fa-heartbeat',
      title: 'Healthcare Improvement',
      description: 'Better income allows families to access quality healthcare and nutrition.'
    },
    {
      icon: 'fas fa-home',
      title: 'Infrastructure Development',
      description: 'Communities invest in better housing, roads, and local infrastructure.'
    },
    {
      icon: 'fas fa-handshake',
      title: 'Women Empowerment',
      description: 'Women farmers gain financial independence and decision-making power.'
    }
  ];

  const environmentalImpact = [
    {
      icon: 'fas fa-recycle',
      title: 'Reduced Food Waste',
      description: 'Direct market access reduces transportation time and food spoilage.'
    },
    {
      icon: 'fas fa-seedling',
      title: 'Sustainable Farming',
      description: 'Market insights encourage crop diversification and sustainable practices.'
    },
    {
      icon: 'fas fa-truck',
      title: 'Optimized Logistics',
      description: 'Efficient routing reduces carbon footprint and transportation costs.'
    },
    {
      icon: 'fas fa-water',
      title: 'Resource Conservation',
      description: 'Better planning reduces water and fertilizer wastage.'
    }
  ];

  const futureGoals = [
    {
      year: '2025',
      target: '10,000+ Farmers',
      description: 'Expand to 10,000+ active farmers across Bihar and neighboring states'
    },
    {
      year: '2026',
      target: '₹50Cr+ Value',
      description: 'Generate ₹50+ crore in value for farming communities'
    },
    {
      year: '2027',
      target: 'Pan-India',
      description: 'Launch operations in 5+ major agricultural states'
    },
    {
      year: '2028',
      target: '1M+ Farmers',
      description: 'Empower 1 million+ farmers across India'
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
    <div className="social-impact-page">
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
            Our Social Impact
          </motion.h1>
          <motion.p 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Transforming lives and communities through technology-driven agricultural innovation
          </motion.p>
        </div>
      </motion.section>

      {/* Impact Metrics */}
      <motion.section 
        className="impact-metrics"
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
            Impact at a Glance
          </motion.h2>
          <div className="metrics-grid">
            {impactMetrics.map((metric, index) => (
              <motion.div 
                key={index}
                className="metric-card"
                variants={itemVariants}
                whileHover={{ 
                  y: -10, 
                  scale: 1.05,
                  transition: { duration: 0.3 }
                }}
              >
                <div className="metric-icon">
                  <i className={metric.icon}></i>
                </div>
                <div className="metric-number">{metric.number}</div>
                <h3>{metric.title}</h3>
                <p>{metric.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Farmer Stories */}
      <motion.section 
        className="farmer-stories"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="container">
          <motion.div 
            className="section-header"
            variants={itemVariants}
          >
            <h2 className="section-title">Stories of Change</h2>
            <p className="section-subtitle">Real farmers, real transformations, real impact</p>
          </motion.div>
          
          <div className="stories-grid">
            {farmerStories.map((story, index) => (
              <motion.div 
                key={index}
                className="story-card"
                variants={itemVariants}
                whileHover={{ 
                  y: -12, 
                  scale: 1.03,
                  transition: { duration: 0.4 }
                }}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <div className="story-header">
                  <div className="story-image">
                    <div className="image-placeholder" style={{ background: story.color }}>
                      <i className={story.icon}></i>
                    </div>
                  </div>
                  <div className="story-stats">
                    <div className="stat-item">
                      <span className="stat-label">Current Income</span>
                      <span className="stat-value">{story.income}</span>
                    </div>
                    <div className="stat-item improvement">
                      <span className="stat-label">Improvement</span>
                      <span className="stat-value">{story.improvement}</span>
                    </div>
                  </div>
                </div>
                
                <div className="story-content">
                  <div className="story-info">
                    <h3>{story.name}</h3>
                    <p className="story-location">
                      <i className="fas fa-map-marker-alt"></i>
                      {story.location}
                    </p>
                    <p className="story-crop">
                      <i className="fas fa-seedling"></i>
                      {story.crop}
                    </p>
                  </div>
                  
                  <div className="story-quote">
                    <div className="quote-icon">
                      <i className="fas fa-quote-left"></i>
                    </div>
                    <p className="story-text">"{story.story}"</p>
                  </div>
                  
                  <div className="story-footer">
                    <div className="success-badge">
                      <i className="fas fa-check-circle"></i>
                      Success Story
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            className="stories-cta"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <p>Join thousands of farmers who have transformed their lives with DirectFarm</p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/register" className="btn btn-primary">
                <i className="fas fa-user-plus"></i>
                Start Your Success Story
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Community Benefits */}
      <motion.section 
        className="community-benefits"
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
            Community Transformation
          </motion.h2>
          <div className="benefits-grid">
            {communityBenefits.map((benefit, index) => (
              <motion.div 
                key={index}
                className="benefit-card"
                variants={itemVariants}
                whileHover={{ 
                  y: -5, 
                  scale: 1.03,
                  transition: { duration: 0.3 }
                }}
              >
                <div className="benefit-icon">
                  <i className={benefit.icon}></i>
                </div>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Environmental Impact */}
      <motion.section 
        className="environmental-impact"
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
            Environmental Sustainability
          </motion.h2>
          <div className="environmental-grid">
            {environmentalImpact.map((impact, index) => (
              <motion.div 
                key={index}
                className="environmental-card"
                variants={itemVariants}
                whileHover={{ 
                  y: -5, 
                  scale: 1.03,
                  transition: { duration: 0.3 }
                }}
              >
                <div className="environmental-icon">
                  <i className={impact.icon}></i>
                </div>
                <h3>{impact.title}</h3>
                <p>{impact.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Future Goals */}
      <motion.section 
        className="future-goals"
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
            Our Vision for the Future
          </motion.h2>
          <div className="goals-timeline">
            {futureGoals.map((goal, index) => (
              <motion.div 
                key={index}
                className="goal-item"
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.3 }
                }}
              >
                <div className="goal-year">{goal.year}</div>
                <div className="goal-content">
                  <h3>{goal.target}</h3>
                  <p>{goal.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Call to Action */}
      <motion.section 
        className="cta-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="container">
          <motion.div 
            className="cta-content"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2>Join the Movement</h2>
            <p>Be part of the transformation in Indian agriculture. Together, we can create a more equitable and sustainable future for farmers.</p>
            <div className="cta-buttons">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/register" className="btn btn-primary">
                  <i className="fas fa-user-plus"></i>
                  Join as Farmer
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/about" className="btn btn-secondary">
                  <i className="fas fa-info-circle"></i>
                  Learn More
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default SocialImpact;
