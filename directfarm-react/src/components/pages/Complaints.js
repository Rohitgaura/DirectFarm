import React, { useState } from 'react';
import { toast } from 'react-toastify';
import apiService from '../../services/api';
import { ComplaintTrackingModal } from '../common/ComplaintTrackingModal';
import { useLanguage } from '../../context/LanguageContext';

const Complaints = () => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        description: ''
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [lastRequestId, setLastRequestId] = useState(null);

    const { name, email, description } = formData;

    const onChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await apiService.submitComplaint(formData);
            if (res.success || res.requestId) {
                setLastRequestId(res.requestId);
                toast.success(`Complaint Submitted! Request ID: ${res.requestId}`);
                setFormData({ name: '', email: '', description: '' });
            } else {
                toast.error(res.message || 'Error submitting complaint');
            }

        } catch (err) {
            console.error(err);
            toast.error('Error submitting complaint');
        }
    };

    return (
        <div className="container" style={{ marginTop: '100px', minHeight: '60vh' }}>
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card shadow-sm">
                        <div className="card-body p-5">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h2 className="text-primary mb-0">{t('complaints.title')}</h2>
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={() => setIsModalOpen(true)}
                                >
                                    {t('complaints.trackComplaint')}
                                </button>
                            </div>

                            <p className="lead mb-4">
                                {t('complaints.subtitle')}
                            </p>

                            {lastRequestId && (
                                <div className="alert alert-success">
                                    <strong>Success!</strong> Your Request ID is: <strong>{lastRequestId}</strong>.
                                    Please save this ID to track your complaint status. An email has also been sent to you.
                                </div>
                            )}

                            <form onSubmit={onSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="name" className="form-label">{t('complaints.name')}</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="name"
                                        name="name"
                                        value={name}
                                        onChange={onChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">{t('complaints.email')}</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        name="email"
                                        value={email}
                                        onChange={onChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="description" className="form-label">{t('complaints.description')}</label>
                                    <textarea
                                        className="form-control"
                                        id="description"
                                        name="description"
                                        rows="5"
                                        value={description}
                                        onChange={onChange}
                                        required
                                    ></textarea>
                                </div>
                                <div className="d-grid gap-2">
                                    <button type="submit" className="btn btn-primary btn-lg">
                                        {t('complaints.submitComplaint')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {isModalOpen && <ComplaintTrackingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

export default Complaints;
