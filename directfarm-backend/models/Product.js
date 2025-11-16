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
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
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
      latitude: {
        type: Number
      },
      longitude: {
        type: Number
      }
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

module.exports = mongoose.model('Product', productSchema);
