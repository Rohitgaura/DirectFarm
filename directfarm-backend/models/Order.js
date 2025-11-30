const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Buyer ID is required']
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'delivered', 'cancelled'],
    default: 'pending'
  },
  isRatedByBuyer: {
    type: Boolean,
    default: false
  },
  isRatedBySeller: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: false // Only createdAt, no updatedAt
});

// Calculate totalAmount before saving
orderSchema.pre('save', function (next) {
  if (this.items && this.items.length > 0 && !this.totalAmount) {
    this.totalAmount = this.items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
  }
  next();
});

// Index for faster queries
orderSchema.index({ buyerId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
