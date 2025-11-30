import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import '../../styles/Career.css';

const Career = () => {
    const jobOpenings = [
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
            title: 'Health Insurance',
            description: 'Comprehensive health coverage for you and your family'
        },
        {
            icon: 'fa-laptop',
            title: 'Remote Work',
            description: 'Work from anywhere with flexible hours'
        },
        {
            icon: 'fa-graduation-cap',
            title: 'Learning Budget',
            description: 'Annual budget for courses and conferences'
        },
        {
            icon: 'fa-users',
            title: 'Great Team',
            description: 'Work with passionate people making real impact'
        },
        {
            icon: 'fa-seedling',
            title: 'Social Impact',
            description: 'Help empower farmers and transform agriculture'
        },
        {
            icon: 'fa-chart-line',
            title: 'Growth Opportunities',
            description: 'Fast-growing startup with career advancement'
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
                        Join Our Mission
                    </motion.h1>
                    <motion.p
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        Help us revolutionize agriculture and empower farmers across the country
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
                        Why Join DirectFarm?
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
                        Open Positions
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
                                    <h4>Requirements:</h4>
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
                                    Apply Now
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
                        <h2>Don't See Your Role?</h2>
                        <p>We're always looking for talented people. Send us your resume!</p>
                        <a href="mailto:careers@directfarm.com" className="cta-btn">
                            <i className="fas fa-envelope"></i>
                            Email Your Resume
                        </a>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default Career;
