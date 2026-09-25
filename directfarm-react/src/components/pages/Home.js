import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import apiService from '../../services/api';
import authUtils from '../../utils/auth';
import AnimatedCounter from '../common/AnimatedCounter';
import '../../styles/Home.css';

const Home = () => {
  const [user, setUser] = useState(null);
  const [liveStats, setLiveStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // ✅ Load and validate user from localStorage
  useEffect(() => {
    let isMounted = true;
    let verifyTimeout = null;

    const loadUser = async () => {
      const storedUser = authUtils.getUser();
      const token = authUtils.getToken();

      if (storedUser && token) {
        try {
          // Set user immediately from localStorage (optimistic update)
          if (isMounted) {
            setUser(storedUser);
          }

          // Verify token in background (debounced)
          clearTimeout(verifyTimeout);
          verifyTimeout = setTimeout(async () => {
            try {
              const result = await apiService.verifyToken();
              if (!isMounted) return;

              if (result && result.valid === false) {
                authUtils.clearAuth();
                setUser(null);
              }
            } catch (error) {
              // Only clear on auth errors (401, 403), not on network errors
              if (error.status === 401 || error.status === 403) {
                if (isMounted) {
                  authUtils.clearAuth();
                  setUser(null);
                }
              }
            }
          }, 500); // Debounce verification by 500ms
        } catch (error) {
          console.error('Error loading user:', error);
          if (isMounted) {
            setUser(null);
          }
        }
      } else {
        if (isMounted) {
          setUser(null);
        }
      }
    };

    // Run on mount only
    loadUser();

    // ✅ Re-run when login/logout occurs (debounced)
    const handleStorageChange = () => {
      clearTimeout(verifyTimeout);
      verifyTimeout = setTimeout(loadUser, 300);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userChanged', handleStorageChange);

    return () => {
      isMounted = false;
      clearTimeout(verifyTimeout);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userChanged', handleStorageChange);
    };
  }, []);

  // ✅ Fetch live platform stats
  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      try {
        const response = await apiService.getPublicStats();
        if (isMounted && response.success) {
          setLiveStats(response.data);
        }
      } catch (error) {
        console.error('Error fetching public stats:', error);
        // Fallback handled in render
      } finally {
        if (isMounted) {
          setStatsLoading(false);
        }
      }
    };

    fetchStats();
    return () => { isMounted = false; };
  }, []);

  // ✅ Highlights & Impact data
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

  // Live stats cards config — driven by API data when available
  const getLiveStatsCards = () => {
    if (!liveStats) {
      // Fallback to hardcoded values if API failed
      return [
        { icon: 'fas fa-users', value: 1000, suffix: '+', title: 'Farmers Connected', description: 'Growing network across Bihar and neighboring states', color: '#4CAF50' },
        { icon: 'fas fa-store', value: 500, suffix: '+', title: 'Active Buyers', description: 'Retailers and wholesalers on the platform', color: '#2196F3' },
        { icon: 'fas fa-seedling', value: 2000, suffix: '+', title: 'Products Listed', description: 'Fresh produce available for direct purchase', color: '#FF9800' },
        { icon: 'fas fa-shopping-bag', value: 5000, suffix: '+', title: 'Orders Completed', description: 'Successful transactions on the platform', color: '#E91E63' },
      ];
    }

    return [
      { icon: 'fas fa-users', value: liveStats.totalFarmers, suffix: '+', title: 'Farmers Connected', description: 'Growing network across Bihar and neighboring states', color: '#4CAF50' },
      { icon: 'fas fa-store', value: liveStats.totalBuyers, suffix: '+', title: 'Active Buyers', description: 'Retailers and wholesalers on the platform', color: '#2196F3' },
      { icon: 'fas fa-seedling', value: liveStats.totalProducts, suffix: '+', title: 'Products Listed', description: 'Fresh produce available for direct purchase', color: '#FF9800' },
      { icon: 'fas fa-shopping-bag', value: liveStats.totalOrders, suffix: '+', title: 'Orders Completed', description: 'Successful transactions on the platform', color: '#E91E63' },
    ];
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
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
              {user ? (
                // ✅ Logged-in view
                <div className="welcome-message">
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="welcome-card"
                  >
                    <h3>Welcome back, {user.name}!</h3>
                    <p>You're logged in as a <strong>{user.role}</strong></p>

                    {user.role === 'farmer' ? (
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link to="/farmer-dashboard" className="btn btn-primary">
                          <i className="fas fa-tachometer-alt"></i>
                          Go to Dashboard
                        </Link>
                      </motion.div>
                    ) : user.role === 'admin' ? (
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link to="/admin-dashboard" className="btn btn-primary">
                          <i className="fas fa-tachometer-alt"></i>
                          Admin Dashboard
                        </Link>
                      </motion.div>
                    ) : (
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link to="/buyer-dashboard" className="btn btn-primary">
                          <i className="fas fa-shopping-cart"></i>
                          Browse Products
                        </Link>
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              ) : (
                // ✅ Guest view
                <>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/register" className="btn btn-primary">
                      <i className="fas fa-user-farmer"></i>
                      Join as Farmer
                    </Link>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/register" className="btn btn-secondary">
                      <i className="fas fa-store"></i>
                      Join as Buyer
                    </Link>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/login" className="btn btn-outline">
                      <i className="fas fa-sign-in-alt"></i>
                      Login
                    </Link>
                  </motion.div>
                </>
              )}
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
          <motion.h2 className="section-title" variants={itemVariants}>
            Why Choose DirectFarm?
          </motion.h2>
          <div className="highlights-grid">
            {highlights.map((highlight, index) => (
              <motion.div
                key={index}
                className="highlight-card"
                variants={itemVariants}
                whileHover={{ y: -10, scale: 1.02, transition: { duration: 0.3 } }}
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
            <motion.div className="about-text" variants={itemVariants}>
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
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/about" className="btn btn-outline">Learn More</Link>
              </motion.div>
            </motion.div>

            <motion.div className="about-image" variants={itemVariants}>
              <div className="image-placeholder">
                <i className="fas fa-users"></i>
                <p>Farmers & Technology</p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Live Stats / Impact Section */}
      <motion.section
        id="impact"
        className="testimonials"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="container">
          <motion.h2 className="section-title" variants={itemVariants}>
            Our Impact
          </motion.h2>
          <div className="impact-grid live-stats-grid">
            {statsLoading ? (
              // Loading skeleton
              [1, 2, 3, 4].map((i) => (
                <motion.div key={i} className="impact-card live-stat-card" variants={itemVariants}>
                  <div className="live-stat-icon-wrapper skeleton-pulse">
                    <div className="skeleton-icon"></div>
                  </div>
                  <div className="skeleton-number skeleton-pulse"></div>
                  <div className="skeleton-title skeleton-pulse"></div>
                  <div className="skeleton-desc skeleton-pulse"></div>
                </motion.div>
              ))
            ) : (
              getLiveStatsCards().map((stat, index) => (
                <motion.div
                  key={index}
                  className="impact-card live-stat-card"
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: 1.03, transition: { duration: 0.3 } }}
                >
                  <div className="live-stat-icon-wrapper" style={{ background: `linear-gradient(135deg, ${stat.color}, ${stat.color}88)` }}>
                    <i className={stat.icon}></i>
                  </div>
                  <div className="impact-number live-stat-number">
                    <AnimatedCounter
                      end={stat.value}
                      duration={2500}
                      suffix={stat.suffix}
                      separator=","
                    />
                  </div>
                  <h3>{stat.title}</h3>
                  <p>{stat.description}</p>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default Home;
