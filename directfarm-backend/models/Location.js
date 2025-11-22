const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    state: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    district: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    subdistrict: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    village: {
        type: String,
        required: true,
        trim: true,
        index: true
    }
}, {
    timestamps: true
});

// Compound index for efficient hierarchical queries
locationSchema.index({ state: 1, district: 1, subdistrict: 1, village: 1 }, { unique: true });

module.exports = mongoose.model('Location', locationSchema);
