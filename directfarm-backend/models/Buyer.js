const mongoose = require('mongoose');

const buyerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Buyer name is required'],
    trim: true,
    maxlength: [100, 'Buyer name cannot exceed 100 characters']
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
  verificationStatus: {
    type: Boolean,
    default: false
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for order history
buyerSchema.virtual('orders', {
  ref: 'Order',
  localField: 'userId',
  foreignField: 'buyerId'
});

// Index on userId for faster lookups
buyerSchema.index({ userId: 1 });

module.exports = mongoose.model('Buyer', buyerSchema);
