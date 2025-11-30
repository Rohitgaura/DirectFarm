const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: [true, 'Order ID is required']
    },
    ratedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Rater ID is required']
    },
    ratedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Rated user ID is required']
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: 1,
        max: 5
    },
    review: {
        type: String,
        trim: true,
        maxlength: [500, 'Review cannot exceed 500 characters']
    },
    role: {
        type: String,
        enum: ['farmer', 'buyer'],
        required: true
    }
}, {
    timestamps: true
});

// Prevent duplicate ratings for the same order by the same user
ratingSchema.index({ orderId: 1, ratedBy: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
