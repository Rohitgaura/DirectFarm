const mongoose = require('mongoose');

const buyerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },
  buyerName: {
    type: String,
    trim: true,
    maxlength: [100, 'Buyer name cannot exceed 100 characters']
  },
  buyerLocation: {
    type: String,
    trim: true
  },
  verificationStatus: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index on userId for faster lookups
buyerSchema.index({ userId: 1 });

module.exports = mongoose.model('Buyer', buyerSchema);

