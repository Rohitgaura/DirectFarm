const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Farmer ID is required']
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
  pricePerKg: {
    type: Number,
    required: [true, 'Price per kg is required'],
    min: [0, 'Price per kg cannot be negative']
  },
  harvestingDate: {
    type: Date
  },
  description: {
    type: String,
    trim: true
  },
  images: [{
    type: String
  }],
  location: {
    state: {
      type: String,
      trim: true
    },
    district: {
      type: String,
      trim: true
    },
    subdistrict: {
      type: String,
      trim: true
    },
    village: {
      type: String,
      trim: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  }
}, {
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: false // Only createdAt, no updatedAt
});

// Index for search functionality
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ farmerId: 1 });
// productSchema.index({ 'location.coordinates': '2dsphere' }); // Already defined in schema option

// Geocode location logic
productSchema.pre('save', async function (next) {
  if (!this.location) {
    return next();
  }

  const geocoder = require('../utils/geocoder');

  // Case 1: Coordinates exist but address is missing -> Reverse Geocode
  if (this.location.coordinates && this.location.coordinates.length === 2 &&
    (!this.location.state || !this.location.district)) {

    try {
      const [lng, lat] = this.location.coordinates;
      const results = await geocoder.reverse({ lat, lon: lng });

      if (results && results.length > 0) {
        const loc = results[0];

        // Robust extraction
        let state = loc.state || loc.administrativeLevels?.level1long;
        let district = loc.district || loc.city || loc.administrativeLevels?.level2long;
        let subdistrict = loc.county || loc.administrativeLevels?.level3long;
        let village = loc.streetName || loc.neighbourhood;

        // Fallback: Parse formatted address if fields are missing
        // Format usually: "Street, Suburb, City, State, Zip, Country"
        if ((!state || !district) && loc.formattedAddress) {
          const parts = loc.formattedAddress.split(',').map(p => p.trim());
          if (parts.length >= 3) {
            // Try to map from end: Country, Zip, State, City...
            // This is heuristic and depends on the provider format
            const countryIndex = parts.length - 1; // Assuming last is Country
            // Check if zip is second to last
            const hasZip = /^\d+$/.test(parts[parts.length - 2]);
            const stateIndex = hasZip ? parts.length - 3 : parts.length - 2;

            if (!state && stateIndex >= 0) state = parts[stateIndex];
            if (!district && stateIndex - 1 >= 0) district = parts[stateIndex - 1];
          }
        }

        this.location.state = state || '';
        this.location.district = district || '';
        this.location.subdistrict = subdistrict || '';
        this.location.village = village || loc.formattedAddress?.split(',')[0] || '';

        console.log('Reverse geocoded location:', this.location);
      }
    } catch (err) {
      console.error('Product reverse geocoding error:', err);
    }
  }

  // Case 2: Address exists but coordinates are missing -> Forward Geocode
  else if ((!this.location.coordinates || this.location.coordinates.length === 0) &&
    (this.location.village || this.location.subdistrict || this.location.district || this.location.state)) {

    const locParts = [];
    if (this.location.village) locParts.push(this.location.village);
    if (this.location.subdistrict) locParts.push(this.location.subdistrict);
    if (this.location.district) locParts.push(this.location.district);
    if (this.location.state) locParts.push(this.location.state);

    if (locParts.length > 0) {
      const address = locParts.join(', ');
      try {
        const loc = await geocoder.geocode(address);
        if (loc && loc.length > 0) {
          this.location.coordinates = [loc[0].longitude, loc[0].latitude];
        }
      } catch (err) {
        console.error('Product geocoding error:', err);
      }
    }
  }

  next();
});

module.exports = mongoose.model('Product', productSchema);
