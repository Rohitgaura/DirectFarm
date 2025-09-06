import React from 'react';
import { motion } from 'framer-motion';
//import { Link } from 'react-router-dom';
import './About.css';

const About = () => {
  const problems = [
    {
      icon: 'fas fa-coins',
      title: 'Low Income',
      description: 'Farmers earn only 30-40% of the final market price due to middlemen exploitation'
    },
    {
      icon: 'fas fa-trash',
      title: 'High Food Wastage',
      description: 'Up to 40% of produce is wasted due to lack of market access and storage'
    },
    {
      icon: 'fas fa-mobile-alt',
      title: 'Digital Divide',
      description: 'Limited access to technology and digital literacy among farmers'
    },
    {
      icon: 'fas fa-road',
      title: 'Poor Infrastructure',
      description: 'Inadequate transportation and cold storage facilities'
    }
  ];

  const solutions = [
    {
      icon: 'fas fa-globe',
      title: 'Direct Market Access',
      description: 'Connect farmers directly with retailers and wholesalers'
    },
    {
      icon: 'fas fa-shield-alt',
      title: 'Transparent Pricing',
      description: 'Real-time market prices and fair trade practices'
    },
    {
      icon: 'fas fa-truck',
      title: 'Logistics Support',
      description: 'End-to-end transportation and cold storage solutions'
    },
    {
      icon: 'fas fa-chart-line',
      title: 'Market Intelligence',
      description: 'Data-driven insights for better crop planning'
    }
  ];

  const techFeatures = [
    'Mobile-first responsive design',
    'Real-time price updates',
    'Secure payment processing',
    'GPS tracking for logistics',
    'Multi-language support',
    'Offline functionality'
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
    <div className="about-page">
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
            About DirectFarm
          </motion.h1>
          <motion.p 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Empowering farmers through technology and direct market access
          </motion.p>
        </div>
      </motion.section>

      {/* Story Section */}
      <motion.section 
        className="story-section"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="container">
          <div className="story-content">
            <motion.div 
              className="story-text"
              variants={itemVariants}
            >
              <h2>The Story Behind DirectFarm</h2>
              <p>
                Farmers in Bihar, India, face significant challenges that have persisted for generations. 
                Despite being the backbone of our food security, they struggle with low income, high 
                food wastage, and limited access to modern markets.
              </p>
              <p>
                The traditional agricultural supply chain involves multiple intermediaries - from local 
                traders to wholesale markets, each taking a significant cut of the farmer's earnings. 
                This leaves farmers with only 30-40% of the final market price, barely enough to cover 
                production costs.
              </p>
              <p>
                Additionally, the lack of proper market access and storage facilities leads to massive 
                food wastage, with up to 40% of produce being lost before reaching consumers. This 
                not only affects farmer income but also contributes to food insecurity.
              </p>
            </motion.div>
            <motion.div 
              className="story-image"
              variants={itemVariants}
            >
              <div className="image-placeholder large">
                <i className="fas fa-users"></i>
                <p>Farmers & Technology</p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Problems Section */}
      <motion.section 
        className="problems-section"
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
            Key Challenges We're Solving
          </motion.h2>
          <div className="problem-list">
            {problems.map((problem, index) => (
              <motion.div 
                key={index}
                className="problem-item"
                variants={itemVariants}
                whileHover={{ 
                  y: -5, 
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
              >
                <div className="problem-icon">
                  <i className={problem.icon}></i>
                </div>
                <div className="problem-content">
                  <h3>{problem.title}</h3>
                  <p>{problem.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Mission & Vision Section */}
      <motion.section 
        className="mission-vision"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="container">
          <div className="mission-vision-grid">
            <motion.div 
              className="mission-card"
              variants={itemVariants}
              whileHover={{ 
                y: -10, 
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
            >
              <div className="card-icon">
                <i className="fas fa-bullseye"></i>
              </div>
              <h2>Our Mission</h2>
              <p>
                To revolutionize agricultural commerce by creating a transparent, efficient, and 
                equitable marketplace that connects farmers directly with buyers, ensuring fair 
                prices and reducing food wastage through technology-driven solutions.
              </p>
            </motion.div>
            <motion.div 
              className="vision-card"
              variants={itemVariants}
              whileHover={{ 
                y: -10, 
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
            >
              <div className="card-icon">
                <i className="fas fa-eye"></i>
              </div>
              <h2>Our Vision</h2>
              <p>
                To become the leading digital platform that transforms agricultural supply chains 
                across India, empowering millions of farmers with better income opportunities and 
                contributing to national food security.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Solutions Section */}
      <motion.section 
        className="solution-section"
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
            Our Solutions
          </motion.h2>
          <div className="solution-grid">
            {solutions.map((solution, index) => (
              <motion.div 
                key={index}
                className="solution-card"
                variants={itemVariants}
                whileHover={{ 
                  y: -8, 
                  scale: 1.03,
                  transition: { duration: 0.3 }
                }}
              >
                <div className="solution-icon">
                  <i className={solution.icon}></i>
                </div>
                <h3>{solution.title}</h3>
                <p>{solution.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Tech Integration Section */}
      <motion.section 
        className="tech-integration"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="container">
          <div className="tech-content">
            <motion.div 
              className="tech-text"
              variants={itemVariants}
            >
              <h2>Technology Integration</h2>
              <p>
                DirectFarm leverages cutting-edge technology to create a seamless experience for 
                both farmers and buyers. Our platform combines mobile technology, data analytics, 
                and logistics optimization to revolutionize agricultural commerce.
              </p>
              <ul className="tech-features">
                {techFeatures.map((feature, index) => (
                  <motion.li 
                    key={index}
                    initial={{ x: -50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ x: 10 }}
                  >
                    <i className="fas fa-check-circle"></i>
                    {feature}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            <motion.div 
              className="tech-image"
              variants={itemVariants}
            >
              <div className="image-placeholder large">
                <i className="fas fa-laptop-code"></i>
                <p>Technology Platform</p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default About;
