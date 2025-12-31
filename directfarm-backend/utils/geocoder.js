const NodeGeocoder = require('node-geocoder');

const options = {
  provider: 'openstreetmap',
  httpAdapter: 'fetch',
  formatter: null,
  // OpenStreetMap Nominatim requires a custom User-Agent
  // See: https://operations.osmfoundation.org/policies/nominatim/
  fetch: {
    headers: {
      'User-Agent': 'DirectFarm-Application/1.0 (contact: your-email@example.com)'
    }
  }
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;
