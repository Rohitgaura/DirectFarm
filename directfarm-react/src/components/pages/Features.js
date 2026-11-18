import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import '../../styles/Features.css';

const Features = () => {
  const { t, language } = useLanguage();

  const farmerFeatures = language === 'hi' ? [
    {
      icon: 'fas fa-mobile-alt',
      title: 'सरल फसल लिस्टिंग',
      description: 'अपनी उपज को फोटो, विवरण और मूल्य के साथ आसानी से सूचीबद्ध करने का सरल इंटरफ़ेस'
    },
    {
      icon: 'fas fa-chart-line',
      title: 'रियल-टाइम बाज़ार भाव',
      description: 'सही विक्रय निर्णय लेने के लिए ताज़ा बाज़ार भावों के लाइव अपडेट प्राप्त करें'
    },
    {
      icon: 'fas fa-handshake',
      title: 'खरीदारों से सीधा संपर्क',
      description: 'खुदरा विक्रेताओं, थोक व्यापारियों और बड़े खरीदारों से सीधे जुड़ें'
    },
    {
      icon: 'fas fa-credit-card',
      title: 'सुरक्षित व पारदर्शी भुगतान',
      description: 'पूर्ण पारदर्शिता के साथ सीधे अपने बैंक खाते में समय पर भुगतान प्राप्त करें'
    }
  ] : [
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

  const buyerFeatures = language === 'hi' ? [
    {
      icon: 'fas fa-search',
      title: 'उन्नत खोज प्रणाली',
      description: 'विशिष्ट फसलें, किसान स्थान और गुणवत्ता आवश्यकताएं आसानी से खोजें'
    },
    {
      icon: 'fas fa-filter',
      title: 'स्मार्ट फ़िल्टरिंग',
      description: 'मूल्य, दूरी दायरा, कटाई तिथि और गुणवत्ता प्राथमिकताओं के आधार पर फ़िल्टर करें'
    },
    {
      icon: 'fas fa-truck',
      title: 'लॉजिस्टिक्स सहायता',
      description: 'परिवहन, कोल्ड स्टोरेज और डोरस्टेप डिलीवरी की संपूर्ण व्यवस्था'
    },
    {
      icon: 'fas fa-shield-alt',
      title: 'गुणवत्ता आश्वासन',
      description: 'सत्यापित किसान प्रोफाइल, वास्तविक तस्वीरें और पारदर्शी रेटिंग प्रणाली'
    }
  ] : [
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

  const platformFeatures = language === 'hi' ? [
    {
      icon: 'fas fa-globe',
      title: 'बहुभाषी सहायता',
      description: 'हिंदी, अंग्रेजी और स्थानीय बोलियों में सहज उपयोग'
    },
    {
      icon: 'fas fa-wifi',
      title: 'कम इंटरनेट में भी कार्यक्षम',
      description: 'धीमे या कमजोर नेटवर्क में भी आसानी से कार्य करने वाला इंटरफ़ेस'
    },
    {
      icon: 'fas fa-mobile',
      title: 'मोबाइल-फ़र्स्ट डिज़ाइन',
      description: 'स्मार्टफोन और सभी आधुनिक मोबाइल उपकरणों के लिए विशेष रूप से अनुकूलित'
    },
    {
      icon: 'fas fa-database',
      title: 'डेटा एनालिटिक्स व रिपोर्ट',
      description: 'फसल रुझान, मांग पूर्वानुमान और बाज़ार अंतर्दृष्टि'
    }
  ] : [
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
            {t('features.backToHome')}
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
            {t('features.title')}
          </motion.h1>
          <motion.p
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {t('features.subtitle')}
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
            {t('features.whyChoose')}
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
              <h3>{t('features.fastTitle')}</h3>
              <p>{t('features.fastDesc')}</p>
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
              <h3>{t('features.secureTitle')}</h3>
              <p>{t('features.secureDesc')}</p>
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
              <h3>{t('features.communityTitle')}</h3>
              <p>{t('features.communityDesc')}</p>
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
            {t('features.forFarmersTitle')}
          </motion.h2>
          <motion.p
            className="section-subtitle"
            variants={itemVariants}
          >
            {language === 'hi' ? 'अपनी फसल सीधे खरीदारों को बेचने के लिए हर जरूरी साधन' : 'Everything you need to sell your produce directly to buyers'}
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
            {t('features.forBuyersTitle')}
          </motion.h2>
          <motion.p
            className="section-subtitle"
            variants={itemVariants}
          >
            {language === 'hi' ? 'किसानों से सीधे ताज़ा और उच्च गुणवत्ता वाली उपज खरीदने के आधुनिक टूल्स' : 'Powerful tools to find and purchase quality produce directly from farmers'}
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
            {t('features.forPlatformTitle')}
          </motion.h2>
          <motion.p
            className="section-subtitle"
            variants={itemVariants}
          >
            {language === 'hi' ? 'आधुनिक तकनीकी क्षमताएं जो DirectFarm को हर किसान और खरीदार के लिए सुलभ बनाती हैं' : 'Advanced technology features that make DirectFarm accessible to everyone'}
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
