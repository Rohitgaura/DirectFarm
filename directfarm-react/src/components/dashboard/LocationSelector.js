import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import apiService from '../../services/api';
import { toast } from 'react-toastify';
import { useLanguage } from '../../context/LanguageContext';
import '../../styles/LocationSelector.css';

const LocationSelector = ({ onLocationSelect, onClose }) => {
    const { t } = useLanguage();
    const [mode, setMode] = useState('initial'); // initial, manual
    const [loading, setLoading] = useState(false);

    // Manual selection state
    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [subdistricts, setSubdistricts] = useState([]);
    const [villages, setVillages] = useState([]);

    const [selectedLocation, setSelectedLocation] = useState({
        state: '',
        district: '',
        subdistrict: '',
        village: ''
    });

    // Prevent background scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    useEffect(() => {
        if (mode === 'manual') {
            fetchStates();
        }
    }, [mode]);

    const fetchStates = async () => {
        try {
            console.log('Fetching states...');
            const response = await apiService.getStates();
            console.log('States response:', response);
            if (response.success) {
                console.log('Setting states:', response.data);
                setStates(response.data);
            } else {
                console.error('Failed to fetch states - response not successful:', response);
                toast.error('Failed to load states');
            }
        } catch (error) {
            console.error('Error fetching states:', error);
            toast.error('Failed to load states');
        }
    };

    const handleStateChange = async (e) => {
        const state = e.target.value;
        setSelectedLocation({ ...selectedLocation, state, district: '', subdistrict: '', village: '' });
        setDistricts([]);
        setSubdistricts([]);
        setVillages([]);

        if (state) {
            try {
                const response = await apiService.getDistricts(state);
                if (response.success) setDistricts(response.data);
            } catch (error) {
                toast.error('Failed to load districts');
            }
        }
    };

    const handleDistrictChange = async (e) => {
        const district = e.target.value;
        setSelectedLocation({ ...selectedLocation, district, subdistrict: '', village: '' });
        setSubdistricts([]);
        setVillages([]);

        if (district) {
            try {
                const response = await apiService.getSubdistricts(district);
                if (response.success) setSubdistricts(response.data);
            } catch (error) {
                toast.error('Failed to load subdistricts');
            }
        }
    };

    const handleSubdistrictChange = async (e) => {
        const subdistrict = e.target.value;
        setSelectedLocation({ ...selectedLocation, subdistrict, village: '' });
        setVillages([]);

        if (subdistrict) {
            try {
                const response = await apiService.getVillages(subdistrict);
                if (response.success) setVillages(response.data);
            } catch (error) {
                toast.error('Failed to load villages');
            }
        }
    };

    const handleVillageChange = (e) => {
        setSelectedLocation({ ...selectedLocation, village: e.target.value });
    };

    const handleCurrentLocation = () => {
        setLoading(true);
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                onLocationSelect({
                    type: 'current',
                    coordinates: [longitude, latitude]
                });
                setLoading(false);
            },
            (error) => {
                console.error('Geolocation error:', error);
                toast.error('Unable to retrieve your location');
                setLoading(false);
            }
        );
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await apiService.geocodeLocation(selectedLocation);
            if (response.success) {
                onLocationSelect({
                    type: 'manual',
                    coordinates: [response.data.longitude, response.data.latitude],
                    address: response.data.formattedAddress,
                    details: selectedLocation
                });
            } else {
                toast.error('Could not find coordinates for this location');
            }
        } catch (error) {
            console.error('Geocoding error:', error);
            toast.error('Failed to process location');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="location-selector-overlay">
            <motion.div
                className="location-selector-modal"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
            >
                <h2>{t('locationSelector.title')}</h2>
                <p>{t('locationSelector.subtitle')}</p>

                {mode === 'initial' ? (
                    <div className="selector-options">
                        <button
                            className="selector-btn primary"
                            onClick={handleCurrentLocation}
                            disabled={loading}
                        >
                            {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-location-arrow"></i>}
                            {t('locationSelector.useCurrentLocation')}
                        </button>
                        <div className="divider">
                            <span>{t('locationSelector.or')}</span>
                        </div>
                        <button
                            className="selector-btn secondary"
                            onClick={() => setMode('manual')}
                        >
                            <i className="fas fa-map-marked-alt"></i>
                            {t('locationSelector.selectManually')}
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleManualSubmit} className="manual-form">
                        <div className="form-group">
                            <label>{t('locationSelector.state')}</label>
                            <select
                                value={selectedLocation.state}
                                onChange={handleStateChange}
                                required
                            >
                                <option value="">{t('locationSelector.selectState')}</option>
                                {states.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>{t('locationSelector.district')}</label>
                            <select
                                value={selectedLocation.district}
                                onChange={handleDistrictChange}
                                required
                                disabled={!selectedLocation.state}
                            >
                                <option value="">{t('locationSelector.selectDistrict')}</option>
                                {districts.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>{t('locationSelector.subdistrict')}</label>
                            <select
                                value={selectedLocation.subdistrict}
                                onChange={handleSubdistrictChange}
                                required
                                disabled={!selectedLocation.district}
                            >
                                <option value="">{t('locationSelector.selectSubdistrict')}</option>
                                {subdistricts.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>{t('locationSelector.village')}</label>
                            <select
                                value={selectedLocation.village}
                                onChange={handleVillageChange}
                                required
                                disabled={!selectedLocation.subdistrict}
                            >
                                <option value="">{t('locationSelector.selectVillage')}</option>
                                {villages.map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                className="back-btn"
                                onClick={() => setMode('initial')}
                            >
                                {t('locationSelector.back')}
                            </button>
                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={loading}
                            >
                                {loading ? t('common.loading') : t('locationSelector.findProducts')}
                            </button>
                        </div>
                    </form>
                )}
            </motion.div>
        </div>
    );
};

export default LocationSelector;
