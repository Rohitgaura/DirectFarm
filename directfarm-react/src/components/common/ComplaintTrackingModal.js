import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import apiService from '../../services/api';

const ComplaintTrackingModal = ({ isOpen, onClose }) => {
    const [requestId, setRequestId] = useState('');
    const [statusData, setStatusData] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleTrack = async () => {
        if (!requestId) return toast.error('Please enter a Request ID');

        setLoading(true);
        setStatusData(null);

        try {
            const res = await apiService.getComplaint(requestId);
            if (res && res.requestId) {
                setStatusData(res);
            } else {
                toast.error(res.message || 'Complaint not found');
            }
        } catch (err) {
            console.error(err);
            toast.error('Error tracking complaint');
            setStatusData(null);
        } finally {
            setLoading(false);
        }
    };

    // Helper to determine active step status
    const getStepStatus = (stepName) => {
        if (!statusData) return 'pending'; // pending, current, completed
        const steps = ['Received', 'Processing', 'Resolved'];
        const currentIndex = steps.indexOf(statusData.status);
        const stepIndex = steps.indexOf(stepName);

        if (stepIndex < currentIndex) return 'completed';
        if (stepIndex === currentIndex) return 'current';
        return 'pending';
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="modal-overlay" onClick={onClose} style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(5px)',
                    zIndex: 1050,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <motion.div
                        className="modal-content-modern"
                        onClick={e => e.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            width: '90%',
                            maxWidth: '500px',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                            padding: '0',
                            overflow: 'hidden',
                            position: 'relative'
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '20px 24px',
                            borderBottom: '1px solid #f0f0f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: '#fff'
                        }}>
                            <h5 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: '#1a1a1a' }}>
                                <i className="fas fa-search-location" style={{ marginRight: '10px', color: '#2ecc71' }}></i>
                                Track Complaint
                            </h5>
                            <button
                                onClick={onClose}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#999',
                                    fontSize: '1.2rem',
                                    cursor: 'pointer',
                                    padding: '5px',
                                    transition: 'color 0.2s'
                                }}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        {/* Body */}
                        <div style={{ padding: '24px' }}>
                            <p style={{ color: '#666', marginBottom: '20px', fontSize: '0.95rem' }}>
                                Enter your Request ID to check the current status of your complaint.
                            </p>

                            <div className="tracking-input-group" style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                <input
                                    type="text"
                                    placeholder="e.g., CMP-2023-XYZA"
                                    value={requestId}
                                    onChange={(e) => setRequestId(e.target.value)}
                                    style={{
                                        flex: 1,
                                        padding: '12px 16px',
                                        borderRadius: '8px',
                                        border: '1px solid #e0e0e0',
                                        outline: 'none',
                                        fontSize: '1rem',
                                        transition: 'border-color 0.2s'
                                    }}
                                />
                                <button
                                    onClick={handleTrack}
                                    disabled={loading}
                                    style={{
                                        padding: '12px 24px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        backgroundColor: '#2ecc71', // Brand green
                                        color: 'white',
                                        fontWeight: 600,
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        opacity: loading ? 0.7 : 1,
                                        transition: 'background-color 0.2s'
                                    }}
                                >
                                    {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Track'}
                                </button>
                            </div>

                            {statusData && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    style={{ marginTop: '30px', borderTop: '1px solid #f0f0f0', paddingTop: '20px' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', position: 'relative' }}>
                                        {/* Connecting Line */}
                                        <div style={{
                                            position: 'absolute',
                                            top: '15px',
                                            left: '10%',
                                            right: '10%',
                                            height: '2px',
                                            backgroundColor: '#e0e0e0',
                                            zIndex: 0
                                        }}>
                                            <div style={{
                                                height: '100%',
                                                backgroundColor: '#2ecc71',
                                                width: statusData.status === 'Received' ? '0%' : statusData.status === 'Processing' ? '50%' : '100%',
                                                transition: 'width 0.5s ease'
                                            }} />
                                        </div>

                                        {['Received', 'Processing', 'Resolved'].map((step, index) => {
                                            const status = getStepStatus(step);
                                            const isCompleted = status === 'completed';
                                            const isCurrent = status === 'current';
                                            const icons = ['envelope', 'cogs', 'check-circle'];

                                            return (
                                                <div key={step} style={{ position: 'relative', zIndex: 1, textAlign: 'center', flex: 1 }}>
                                                    <div style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '50%',
                                                        backgroundColor: isCompleted || isCurrent ? '#2ecc71' : '#fff',
                                                        border: `2px solid ${isCompleted || isCurrent ? '#2ecc71' : '#e0e0e0'}`,
                                                        color: isCompleted || isCurrent ? '#fff' : '#ccc',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        margin: '0 auto 8px',
                                                        transition: 'all 0.3s'
                                                    }}>
                                                        <i className={`fas fa-${icons[index]}`} style={{ fontSize: '0.8rem' }}></i>
                                                    </div>
                                                    <span style={{
                                                        fontSize: '0.8rem',
                                                        fontWeight: isCurrent ? 700 : 500,
                                                        color: isCompleted || isCurrent ? '#1a1a1a' : '#999'
                                                    }}>
                                                        {step}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div style={{
                                        backgroundColor: '#f8f9fa',
                                        borderRadius: '8px',
                                        padding: '16px',
                                        borderLeft: '4px solid #2ecc71'
                                    }}>
                                        <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '4px' }}>REQUEST ID: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{statusData.requestId}</span></div>
                                        <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '8px' }}>Created: {new Date(statusData.createdAt).toLocaleDateString()}</div>
                                        <p style={{ margin: 0, fontSize: '0.95rem', color: '#333', lineHeight: '1.5' }}>
                                            <strong>Reviewer Note:</strong> {statusData.description}
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export { ComplaintTrackingModal };
