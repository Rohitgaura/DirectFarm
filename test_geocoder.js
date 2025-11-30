const geocoder = require('./directfarm-backend/utils/geocoder');

async function testGeocoder() {
    try {
        // Test coordinates (New Delhi approx)
        const lat = 28.6139;
        const lon = 77.2090;

        console.log(`Testing reverse geocoding for Lat: ${lat}, Lon: ${lon}`);

        const results = await geocoder.reverse({ lat, lon });

        console.log('Result:', JSON.stringify(results, null, 2));

        if (results && results.length > 0) {
            const loc = results[0];
            console.log('Mapped Fields:');
            console.log('State:', loc.state || loc.administrativeLevels?.level1long);
            console.log('District:', loc.district || loc.city || loc.administrativeLevels?.level2long);
            console.log('Subdistrict:', loc.county || loc.administrativeLevels?.level3long);
            console.log('Village/Street:', loc.streetName || loc.formattedAddress?.split(',')[0]);
        } else {
            console.log('No results found');
        }
    } catch (error) {
        console.error('Geocoder error:', error);
    }
}

testGeocoder();
