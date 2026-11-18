import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import apiService from '../../services/api';
import AnimatedCounter from '../common/AnimatedCounter';
import { useLanguage } from '../../context/LanguageContext';
import '../../styles/SocialImpact.css';

const SocialImpact = () => {
  const { t, language } = useLanguage();
  const [liveStats, setLiveStats] = useState(null);

  // Fetch live platform stats
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
      }
    };
    fetchStats();
    return () => { isMounted = false; };
  }, []);

  // Helper to format revenue as ₹ Lakh/Crore
  const formatRevenue = (amount) => {
    if (!amount) return { value: 0, suffix: '' };
    if (amount >= 10000000) {
      return { value: parseFloat((amount / 10000000).toFixed(1)), suffix: ' Cr+', prefix: '₹', decimals: 1 };
    }
    if (amount >= 100000) {
      return { value: parseFloat((amount / 100000).toFixed(1)), suffix: ' L+', prefix: '₹', decimals: 1 };
    }
    return { value: amount, suffix: '+', prefix: '₹', decimals: 0 };
  };

  const revenueData = formatRevenue(liveStats?.totalRevenue);

  const impactMetrics = [
    {
      isStatic: true,
      number: '30-50%',
      title: t('socialImpact.incomeIncrease'),
      description: t('socialImpact.incomeDesc'),
      icon: 'fas fa-chart-line'
    },
    {
      isStatic: true,
      number: '40%',
      title: t('socialImpact.reducedWastage'),
      description: t('socialImpact.reducedDesc'),
      icon: 'fas fa-leaf'
    },
    {
      isStatic: false,
      value: liveStats?.totalFarmers || 0,
      suffix: '+',
      title: t('socialImpact.farmersEmpowered'),
      description: t('socialImpact.farmersEmpoweredDesc'),
      icon: 'fas fa-users'
    },
    {
      isStatic: false,
      value: revenueData.value,
      prefix: revenueData.prefix || '',
      suffix: revenueData.suffix || '',
      decimals: revenueData.decimals || 0,
      title: t('socialImpact.valueGenerated'),
      description: t('socialImpact.valueGeneratedDesc'),
      icon: 'fas fa-rupee-sign'
    }
  ];

  const isHi = language === 'hi';

  const farmerStories = isHi ? [
    {
      name: 'राम कुमार सिंह',
      location: 'पटना, बिहार',
      story: 'डायरेक्टफार्म से पहले मैं केवल ₹15,000 प्रति माह कमाता था। अब मैं सीधे खुदरा विक्रेताओं को बेचकर ₹25,000-30,000 महीना कमाता हूँ। अब मैं अपने बच्चों को बेहतर शिक्षा दिला पा रहा हूँ।',
      image: 'farmer1',
      crop: 'हरी सब्जियां',
      income: '₹30,000',
      improvement: '+100%',
      icon: 'fas fa-chart-line',
      color: '#4CAF50'
    },
    {
      name: 'लक्ष्मी देवी',
      location: 'गया, बिहार',
      story: 'डायरेक्टफार्म ने मुझे दूसरे राज्यों के खरीदारों से जोड़ा। अब मैं अपनी जैविक उपज प्रीमियम दामों पर बेचती हूँ और अपने गाँव की अन्य महिला किसानों को भी प्रशिक्षित कर रही हूँ।',
      image: 'farmer2',
      crop: 'जैविक सब्जियां',
      income: '₹35,000',
      improvement: '+150%',
      icon: 'fas fa-seedling',
      color: '#FF9800'
    },
    {
      name: 'मोहन प्रसाद',
      location: 'भागलपुर, बिहार',
      story: 'इस मंच ने बिचौलियों को खत्म कर दिया जो मेरी कमाई का 40% ले जाते थे। अब मुझे उचित दाम मिलते हैं और बाज़ार की जानकारी से मैं बेहतर फसलों की योजना बना सकता हूँ।',
      image: 'farmer3',
      crop: 'फल व बागवानी',
      income: '₹28,000',
      improvement: '+87%',
      icon: 'fas fa-apple-alt',
      color: '#E91E63'
    }
  ] : [
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

  const communityBenefits = isHi ? [
    {
      icon: 'fas fa-graduation-cap',
      title: 'शिक्षा तक पहुंच',
      description: 'किसानों की बढ़ी हुई आय बच्चों को बेहतर शिक्षा दिलाने और गरीबी के चक्र को तोड़ने में सक्षम बनाती है।'
    },
    {
      icon: 'fas fa-heartbeat',
      title: 'बेहतर स्वास्थ्य सेवाएं',
      description: 'अच्छी आमदनी से परिवारों को गुणवत्तापूर्ण स्वास्थ्य देखभाल और बेहतर पोषण मिलता है।'
    },
    {
      icon: 'fas fa-home',
      title: 'बुनियादी ढांचे का विकास',
      description: 'समुदाय बेहतर आवास, पक्की सड़कों और स्थानीय विकास में निवेश कर पाते हैं।'
    },
    {
      icon: 'fas fa-handshake',
      title: 'महिला सशक्तिकरण',
      description: 'महिला किसानों को वित्तीय स्वतंत्रता, सम्मान और निर्णय लेने का अधिकार मिलता है।'
    }
  ] : [
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

  const environmentalImpact = isHi ? [
    {
      icon: 'fas fa-recycle',
      title: 'खाद्य बर्बादी में भारी कमी',
      description: 'सीधी बाज़ार पहुंच से ढुलाई के समय और फसल खराब होने में भारी कमी आती है।'
    },
    {
      icon: 'fas fa-seedling',
      title: 'टिकाऊ और जैविक खेती',
      description: 'बाज़ार की मांग से किसान फसल विविधीकरण और टिकाऊ तरीकों को अपनाते हैं।'
    },
    {
      icon: 'fas fa-truck',
      title: 'अनुकूलित लॉजिस्टिक्स',
      description: 'कुशल रूटिंग और सीधी डिलीवरी से कार्बन उत्सर्जन और परिवहन लागत घटती है।'
    },
    {
      icon: 'fas fa-water',
      title: 'प्राकृतिक संसाधनों का संरक्षण',
      description: 'उचित योजना से पानी, खाद और रासायनिक उर्वरकों की बर्बादी रुकती है।'
    }
  ] : [
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

  const futureGoals = isHi ? [
    {
      year: '2025',
      target: '10,000+ किसान',
      description: 'बिहार और पड़ोसी राज्यों में 10,000 से अधिक सक्रिय किसानों तक विस्तार'
    },
    {
      year: '2026',
      target: '₹50 करोड़+ मूल्य',
      description: 'किसान समुदायों के लिए ₹50+ करोड़ से अधिक का प्रत्यक्ष आर्थिक मूल्य उत्पन्न करना'
    },
    {
      year: '2027',
      target: 'अखिल भारतीय विस्तार',
      description: '5 से अधिक प्रमुख कृषि राज्यों में पूर्ण संचालन शुरू करना'
    },
    {
      year: '2028',
      target: '10 लाख+ किसान',
      description: 'पूरे भारत में 10 लाख से अधिक किसानों को डिजिटल रूप से सशक्त बनाना'
    }
  ] : [
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
            {t('socialImpact.title')}
          </motion.h1>
          <motion.p
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {t('socialImpact.subtitle')}
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
            {t('socialImpact.impactGlance')}
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
                <div className="metric-number">
                  {metric.isStatic ? (
                    metric.number
                  ) : (
                    <AnimatedCounter
                      end={metric.value}
                      duration={2500}
                      prefix={metric.prefix || ''}
                      suffix={metric.suffix || ''}
                      decimals={metric.decimals || 0}
                      separator=","
                    />
                  )}
                </div>
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
            <h2 className="section-title">{t('socialImpact.storiesTitle')}</h2>
            <p className="section-subtitle">{t('socialImpact.storiesSubtitle')}</p>
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
                      <span className="stat-label">{t('socialImpact.currentIncome')}</span>
                      <span className="stat-value">{story.income}</span>
                    </div>
                    <div className="stat-item improvement">
                      <span className="stat-label">{t('socialImpact.improvement')}</span>
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
                      {t('socialImpact.successStory')}
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
            <p>{t('socialImpact.storiesCtaText')}</p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/register" className="btn btn-primary">
                <i className="fas fa-star"></i>
                {t('socialImpact.storiesCtaBtn')}
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
            {t('socialImpact.communityTitle')}
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
            {t('socialImpact.environmentalTitle')}
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
            {t('socialImpact.futureTitle')}
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
            <h2>{t('socialImpact.joinMovementTitle')}</h2>
            <p>{t('socialImpact.joinMovementDesc')}</p>
            <div className="cta-buttons">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/register" className="btn btn-primary">
                  <i className="fas fa-user-plus"></i>
                  {t('socialImpact.joinFarmerBtn')}
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/about" className="btn btn-secondary">
                  <i className="fas fa-info-circle"></i>
                  {t('socialImpact.learnMoreBtn')}
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
