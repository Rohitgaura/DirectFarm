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

// Geocode location if coordinates are missing
productSchema.pre('save', async function (next) {
  if (!this.location || (this.location.coordinates && this.location.coordinates.length === 2)) {
    return next();
  }

  const locParts = [];
  if (this.location.village) locParts.push(this.location.village);
  if (this.location.subdistrict) locParts.push(this.location.subdistrict);
  if (this.location.district) locParts.push(this.location.district);
  if (this.location.state) locParts.push(this.location.state);

  if (locParts.length === 0) return next();

  const address = locParts.join(', ');
  const geocoder = require('../utils/geocoder');

  try {
    const loc = await geocoder.geocode(address);
    if (loc && loc.length > 0) {
      this.location.coordinates = [loc[0].longitude, loc[0].latitude];
    }
  } catch (err) {
    console.error('Product geocoding error:', err);
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
