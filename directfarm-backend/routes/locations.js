const express = require('express');
const router = express.Router();
const { Location } = require('../models');
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

const geoCache = new Map();

// Reverse geocode coordinates to address
router.post('/reverse-geocode', async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude are required' });
    }

    const cacheKey = `${latitude}-${longitude}`;
    if (geoCache.has(cacheKey)) {
      return res.json({
        success: true,
        data: geoCache.get(cacheKey)
      });
    }

    try {
      const loc = await geocoder.reverse({ lat: latitude, lon: longitude });

      if (!loc || loc.length === 0) {
        return res.json({
          success: true,
          data: {
            formattedAddress: `${parseFloat(latitude).toFixed(6)}, ${parseFloat(longitude).toFixed(6)}`,
            state: '',
            district: '',
            country: '',
            countryCode: '',
            fallback: true
          }
        });
      }

      const addressData = loc[0];

      const district = addressData.district ||
        addressData.city ||
        addressData.county ||
        addressData.state_district ||
        addressData.administrativeLevels?.level2long ||
        '';

      const state = addressData.state ||
        addressData.stateCode ||
        addressData.administrativeLevels?.level1long ||
        '';

      const responseData = {
        formattedAddress: addressData.formattedAddress,
        state,
        district,
        subdistrict: addressData.suburb || addressData.administrativeLevels?.level3long || '',
        village: addressData.village || addressData.town || addressData.hamlet || addressData.neighbourhood || '',
        country: addressData.country || '',
        countryCode: addressData.countryCode || ''
      };

      geoCache.set(cacheKey, responseData);

      res.json({
        success: true,
        data: responseData
      });
    } catch (geocodeError) {
      console.error('Geocoding service unavailable:', geocodeError.message);
      res.json({
        success: true,
        data: {
          formattedAddress: `${parseFloat(latitude).toFixed(6)}, ${parseFloat(longitude).toFixed(6)}`,
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
