const express = require('express');
const router = express.Router();
const Location = require('../models/Location');
const geocoder = require('../utils/geocoder');

// Get all unique states
router.get('/states', async (req, res) => {
    try {
        const states = await Location.distinct('state');
        res.json({ success: true, data: states.sort() });
    } catch (error) {
        console.error('Error fetching states:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get districts for a state
router.get('/districts/:state', async (req, res) => {
    try {
        const districts = await Location.distinct('district', { state: req.params.state });
        res.json({ success: true, data: districts.sort() });
    } catch (error) {
        console.error('Error fetching districts:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get subdistricts for a district
router.get('/subdistricts/:district', async (req, res) => {
    try {
        const subdistricts = await Location.distinct('subdistrict', { district: req.params.district });
        res.json({ success: true, data: subdistricts.sort() });
    } catch (error) {
        console.error('Error fetching subdistricts:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get villages for a subdistrict
router.get('/villages/:subdistrict', async (req, res) => {
    try {
        const villages = await Location.distinct('village', { subdistrict: req.params.subdistrict });
        res.json({ success: true, data: villages.sort() });
    } catch (error) {
        console.error('Error fetching villages:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Geocode a location
router.post('/geocode', async (req, res) => {
    try {
        const { state, district, subdistrict, village } = req.body;

        // Construct address string
        const addressParts = [];
        if (village) addressParts.push(village);
        if (subdistrict) addressParts.push(subdistrict);
        if (district) addressParts.push(district);
        if (state) addressParts.push(state);

        const address = addressParts.join(', ');

        if (!address) {
            return res.status(400).json({ success: false, message: 'Address is required' });
        }

        try {
            const loc = await geocoder.geocode(address);

            if (!loc || loc.length === 0) {
                return res.status(404).json({ success: false, message: 'Location not found' });
            }

            res.json({
                success: true,
                data: {
                    latitude: loc[0].latitude,
                    longitude: loc[0].longitude,
                    formattedAddress: loc[0].formattedAddress
                }
            });
        } catch (geocodeError) {
            console.error('Geocoding service unavailable:', geocodeError.message);
            return res.status(503).json({
                success: false,
                message: 'Geocoding service temporarily unavailable. Please try again later.',
                error: geocodeError.message
            });
        }
    } catch (error) {
        console.error('Geocoding error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Reverse geocode coordinates to address
router.post('/reverse-geocode', async (req, res) => {
    try {
        const { latitude, longitude } = req.body;

        if (!latitude || !longitude) {
            return res.status(400).json({ success: false, message: 'Latitude and longitude are required' });
        }

        try {
            const loc = await geocoder.reverse({ lat: latitude, lon: longitude });

            if (!loc || loc.length === 0) {
                // Return coordinates as fallback if no address found
                return res.json({
                    success: true,
                    data: {
                        formattedAddress: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                        state: '',
                        district: '',
                        country: '',
                        countryCode: '',
                        fallback: true
                    }
                });
            }

            // Extract relevant address components
            const addressData = loc[0];
            res.json({
                success: true,
                data: {
                    formattedAddress: addressData.formattedAddress,
                    state: addressData.state || addressData.administrativeLevels?.level1long || '',
                    district: addressData.city || addressData.administrativeLevels?.level2long || '',
                    country: addressData.country || '',
                    countryCode: addressData.countryCode || ''
                }
            });
        } catch (geocodeError) {
            // Handle network errors (like ENOTFOUND) gracefully
            console.error('Geocoding service unavailable:', geocodeError.message);

            // Return coordinates as fallback when service is unavailable
            res.json({
                success: true,
                data: {
                    formattedAddress: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                    state: '',
                    district: '',
                    country: '',
                    countryCode: '',
                    fallback: true,
                    error: 'Geocoding service temporarily unavailable'
                }
            });
        }
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
