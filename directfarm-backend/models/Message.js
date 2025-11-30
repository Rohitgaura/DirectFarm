const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: false // Optional - for product-specific context
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    read: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Compound index for fast conversation queries
messageSchema.index({ senderId: 1, recipientId: 1 });
messageSchema.index({ recipientId: 1, senderId: 1 });

// Index for unread message queries
messageSchema.index({ recipientId: 1, read: 1 });

module.exports = mongoose.model('Message', messageSchema);
