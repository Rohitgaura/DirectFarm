import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import '../../styles/Career.css';

const Career = () => {
    const { t, language } = useLanguage();
    const isHi = language === 'hi';

    const jobOpenings = isHi ? [
        {
            id: 1,
            title: 'फुल स्टैक डेवलपर (Full Stack Developer)',
            department: 'इंजीनियरिंग',
            location: 'रिमोट / हाइब्रिड',
            type: 'पूर्णकालिक (Full-time)',
            description: 'किसानों और खरीदारों को जोड़ने वाले हमारे डिजिटल प्लेटफ़ॉर्म का निर्माण और रख-रखाव करें। React, Node.js और MongoDB के साथ काम करें।',
            requirements: ['3+ वर्ष का प्रासंगिक अनुभव', 'React और Node.js में गहरी विशेषज्ञता', 'डेटाबेस और एपीआई डिज़ाइन कौशल']
        },
        {
            id: 2,
            title: 'कृषि विशेषज्ञ (Agricultural Specialist)',
            department: 'ऑपरेशंस',
            location: 'फ़ील्ड-आधारित (Field-based)',
            type: 'पूर्णकालिक (Full-time)',
            description: 'किसानों के साथ सीधे काम करें, उन्हें प्लेटफ़ॉर्म पर जोड़ें और फसल गुणवत्ता व मूल्य पर मार्गदर्शन प्रदान करें।',
            requirements: ['कृषि विज्ञान में स्नातक या डिप्लोमा', 'जमीनी फ़ील्ड कार्य का अनुभव', 'उत्कृष्ट क्षेत्रीय संवाद कौशल']
        },
        {
            id: 3,
            title: 'उत्पाद प्रबंधक (Product Manager)',
            department: 'प्रोडक्ट',
            location: 'रिमोट / हाइब्रिड',
            type: 'पूर्णकालिक (Full-time)',
            description: 'किसान-खरीदार बाज़ार के लिए उत्पाद रणनीति, उपयोगकर्ता अनुभव और रोडमैप को आकार दें।',
            requirements: ['5+ वर्ष का प्रोडक्ट मैनेजमेंट अनुभव', 'एग्रीटेक या ई-कॉमर्स पृष्ठभूमि को प्राथमिकता', 'डेटा-संचालित और समस्या-समाधान दृष्टिकोण']
        },
        {
            id: 4,
            title: 'विपणन प्रबंधक (Marketing Manager)',
            department: 'मार्केटिंग',
            location: 'रिमोट (Remote)',
            type: 'पूर्णकालिक (Full-time)',
            description: 'किसान और खरीदार समुदायों के विस्तार के लिए डिजिटल और क्षेत्रीय अभियानों का नेतृत्व करें।',
            requirements: ['डिजिटल मार्केटिंग में सिद्ध अनुभव', 'कंटेंट निर्माण और सोशल मीडिया प्रबंधन', 'ग्रामीण और कृषि बाज़ार की समझ']
        }
    ] : [
        {
            id: 1,
            title: 'Full Stack Developer',
            department: 'Engineering',
            location: 'Remote / Hybrid',
            type: 'Full-time',
            description: 'Build and maintain our platform connecting farmers with buyers. Work with React, Node.js, and MongoDB.',
            requirements: ['3+ years experience', 'React & Node.js expertise', 'Database design skills']
        },
        {
            id: 2,
            title: 'Agricultural Specialist',
            department: 'Operations',
            location: 'Field-based',
            type: 'Full-time',
            description: 'Work directly with farmers to onboard them to our platform and provide agricultural guidance.',
            requirements: ['Agriculture degree', 'Field experience', 'Strong communication skills']
        },
        {
            id: 3,
            title: 'Product Manager',
            department: 'Product',
            location: 'Remote / Hybrid',
            type: 'Full-time',
            description: 'Define product strategy and roadmap for our farmer-buyer marketplace.',
            requirements: ['5+ years PM experience', 'AgriTech background preferred', 'Data-driven mindset']
        },
        {
            id: 4,
            title: 'Marketing Manager',
            department: 'Marketing',
            location: 'Remote',
            type: 'Full-time',
            description: 'Lead marketing initiatives to grow our farmer and buyer communities.',
            requirements: ['Digital marketing expertise', 'Content creation skills', 'Social media management']
        }
    ];

    const benefits = [
        {
            icon: 'fa-heart',
            title: t('career.benefits.healthTitle'),
            description: t('career.benefits.healthDesc')
        },
        {
            icon: 'fa-laptop',
            title: t('career.benefits.remoteTitle'),
            description: t('career.benefits.remoteDesc')
        },
        {
            icon: 'fa-graduation-cap',
            title: t('career.benefits.learningTitle'),
            description: t('career.benefits.learningDesc')
        },
        {
            icon: 'fa-users',
            title: t('career.benefits.teamTitle'),
            description: t('career.benefits.teamDesc')
        },
        {
            icon: 'fa-seedling',
            title: t('career.benefits.impactTitle'),
            description: t('career.benefits.impactDesc')
        },
        {
            icon: 'fa-chart-line',
            title: t('career.benefits.growthTitle'),
            description: t('career.benefits.growthDesc')
        }
    ];

    return (
        <div className="career-page">
            {/* Hero Section */}
            <motion.section
                className="career-hero"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                <div className="career-hero-content">
                    <motion.h1
                        initial={{ y: -30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        {t('career.title')}
                    </motion.h1>
                    <motion.p
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        {t('career.subtitle')}
                    </motion.p>
                </div>
            </motion.section>

            {/* Why Join Us */}
            <section className="why-join-section">
                <div className="container">
                    <motion.h2
                        className="section-title"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        {t('career.whyJoinTitle')}
                    </motion.h2>

                    <div className="benefits-grid">
                        {benefits.map((benefit, index) => (
                            <motion.div
                                key={index}
                                className="benefit-card"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <div className="benefit-icon">
                                    <i className={`fas ${benefit.icon}`}></i>
                                </div>
                                <h3>{benefit.title}</h3>
                                <p>{benefit.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Job Openings */}
            <section className="jobs-section">
                <div className="container">
                    <motion.h2
                        className="section-title"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        {t('career.openPositions')}
                    </motion.h2>

                    <div className="jobs-list">
                        {jobOpenings.map((job, index) => (
                            <motion.div
                                key={job.id}
                                className="job-card"
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <div className="job-header">
                                    <div>
                                        <h3>{job.title}</h3>
                                        <div className="job-meta">
                                            <span className="job-department">
                                                <i className="fas fa-briefcase"></i>
                                                {job.department}
                                            </span>
                                            <span className="job-location">
                                                <i className="fas fa-map-marker-alt"></i>
                                                {job.location}
                                            </span>
                                            <span className="job-type">
                                                <i className="fas fa-clock"></i>
                                                {job.type}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <p className="job-description">{job.description}</p>

                                <div className="job-requirements">
                                    <h4>{t('career.requirements')}</h4>
                                    <ul>
                                        {job.requirements.map((req, idx) => (
                                            <li key={idx}>
                                                <i className="fas fa-check"></i>
                                                {req}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <button className="apply-btn">
                                    <i className="fas fa-paper-plane"></i>
                                    {t('career.applyNow')}
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="career-cta">
                <div className="container">
                    <motion.div
                        className="cta-content"
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2>{t('career.dontSeeRole')}</h2>
                        <p>{t('career.dontSeeRoleDesc')}</p>
                        <a href="mailto:careers@directfarm.com" className="cta-btn">
                            <i className="fas fa-envelope"></i>
                            {t('career.emailResume')}
                        </a>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default Career;
