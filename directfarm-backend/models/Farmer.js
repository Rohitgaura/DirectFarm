const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Farmer name is required'],
    trim: true,
    maxlength: [100, 'Farmer name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  address: {
    type: String,
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    },
    formattedAddress: String
  },
  farmName: {
    type: String,
    trim: true,
    maxlength: [100, 'Farm name cannot exceed 100 characters']
  },
  experienceYears: {
    type: Number,
    required: [true, 'Experience years is required'],
    min: [0, 'Experience years must be at least 0'],
    max: [50, 'Experience years must be at most 50']
  },
  verificationStatus: {
    type: Boolean,
    default: false
  },
  totalProducts: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for uploaded products
farmerSchema.virtual('products', {
  ref: 'Product',
  localField: 'userId',
  foreignField: 'farmerId'
});

// Index on userId for faster lookups
farmerSchema.index({ userId: 1 });

module.exports = mongoose.model('Farmer', farmerSchema);
