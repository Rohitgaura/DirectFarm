const NodeGeocoder = require('node-geocoder');

const options = {
  provider: 'openstreetmap',
  httpAdapter: 'https',
  formatter: null,
  // OpenStreetMap Nominatim requires a custom User-Agent
  // See: https://operations.osmfoundation.org/policies/nominatim/
  headers: {
    'User-Agent': 'DirectFarm-Student-Project/1.0 (rohit.dev.test@example.com)'
  }
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;
