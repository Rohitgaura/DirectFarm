const mongoose = require('mongoose');

const successStorySchema = new mongoose.Schema({
    farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Farmer ID is required']
    },
    farmerName: {
        type: String,
        required: [true, 'Farmer name is required'],
        trim: true
    },
    location: {
        village: String,
        district: String,
        state: String
    },
    story: {
        type: String,
        required: [true, 'Story is required'],
        minlength: [50, 'Story must be at least 50 characters'],
        maxlength: [1000, 'Story cannot exceed 1000 characters']
    },
    beforeIncome: {
        type: Number,
        required: [true, 'Before income is required'],
        min: [0, 'Income cannot be negative']
    },
    currentIncome: {
        type: Number,
        required: [true, 'Current income is required'],
        min: [0, 'Income cannot be negative']
    },
    improvements: [{
        type: String,
        trim: true
    }],
    cropTypes: [{
        type: String,
        trim: true
    }],
    yearsWithPlatform: {
        type: Number,
        default: 0,
        min: [0, 'Years cannot be negative']
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    isFeatured: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Virtual for income improvement percentage
successStorySchema.virtual('incomeImprovement').get(function () {
    if (this.beforeIncome === 0) return 0;
    return Math.round(((this.currentIncome - this.beforeIncome) / this.beforeIncome) * 100);
});

// Index for faster queries
successStorySchema.index({ farmerId: 1 });
successStorySchema.index({ isApproved: 1 });
successStorySchema.index({ isFeatured: 1 });
successStorySchema.index({ createdAt: -1 });

// Ensure virtuals are included in JSON
successStorySchema.set('toJSON', { virtuals: true });
successStorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('SuccessStory', successStorySchema);
