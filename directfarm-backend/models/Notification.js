const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        required: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
