// models/ActivityLog.js
const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  actionType: {
    type: String,
    required: true
  },
  actionDetails: String
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
