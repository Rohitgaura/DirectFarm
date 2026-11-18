import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import '../../styles/About.css';

const About = () => {
  const { t } = useLanguage();
  const problems = [
    {
      icon: 'fas fa-coins',
      title: t('about.lowIncome'),
      description: t('about.lowIncomeDesc')
    },
    {
      icon: 'fas fa-trash',
      title: t('about.highWastage'),
      description: t('about.highWastageDesc')
    },
    {
      icon: 'fas fa-mobile-alt',
      title: t('about.digitalDivide'),
      description: t('about.digitalDivideDesc')
    },
    {
      icon: 'fas fa-road',
      title: t('about.poorInfra'),
      description: t('about.poorInfraDesc')
    }
  ];

  const solutions = [
    {
      icon: 'fas fa-globe',
      title: t('about.directAccess'),
      description: t('about.directAccessDesc')
    },
    {
      icon: 'fas fa-shield-alt',
      title: t('about.transPricing'),
      description: t('about.transPricingDesc')
    },
    {
      icon: 'fas fa-truck',
      title: t('about.logisticsSupport'),
      description: t('about.logisticsSupportDesc')
    },
    {
      icon: 'fas fa-chart-line',
      title: t('about.marketIntel'),
      description: t('about.marketIntelDesc')
    }
  ];

  const techFeatures = [
    t('about.features.mobileFirst'),
    t('about.features.realtimePrice'),
    t('about.features.securePay'),
    t('about.features.gpsTracking'),
    t('about.features.multiLang'),
    t('about.features.offline')
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
            {t('about.title')}
          </motion.h1>
          <motion.p
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {t('about.tagline')}
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
              <h2>{t('about.storyTitle')}</h2>
              <p>{t('about.storyP1')}</p>
              <p>{t('about.storyP2')}</p>
              <p>{t('about.storyP3')}</p>
            </motion.div>
            <motion.div
              className="story-image"
              variants={itemVariants}
            >
              <div className="image-placeholder large">
                <i className="fas fa-users"></i>
                <p>{t('about.farmersTech')}</p>
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
            {t('about.challengesTitle')}
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
              <h2>{t('about.ourMission')}</h2>
              <p>{t('about.missionText')}</p>
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
              <h2>{t('about.ourVision')}</h2>
              <p>{t('about.visionText')}</p>
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
            {t('about.ourSolutions')}
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
              <h2>{t('about.techIntegration')}</h2>
              <p>{t('about.techDesc')}</p>
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
                <p>{t('about.techPlatform')}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default About;
