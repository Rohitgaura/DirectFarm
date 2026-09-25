const NodeGeocoder = require('node-geocoder');
require('dotenv').config();

const options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: process.env.GOOGLE_MAPS_API_KEY,
    formatter: null
};

const geocoder = NodeGeocoder(options);

async function testGeocode() {
    console.log('Testing Geocoding API...');
    console.log('API Key present:', !!process.env.GOOGLE_MAPS_API_KEY);

    try {
        const res = await geocoder.geocode('Patna, Bihar, India');
        console.log('✅ Success! Result:', res);
    } catch (err) {
        console.error('❌ Error:', err);
    }
}

testGeocode();
