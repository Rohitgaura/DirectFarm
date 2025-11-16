// models/Feedback.js
const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['feedback', 'complaint', 'suggestion'],
    required: true,
    default: 'feedback'
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Subject cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: true,
    minlength: [10, 'Message must be at least 10 characters long'],
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, 'Please provide a valid email address']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  // If logged-in user submits feedback
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Optional backend admin fields
  status: {
    type: String,
    enum: ['new', 'in_progress', 'resolved', 'closed'],
    default: 'new'
  },
  adminResponse: {
    type: String,
    maxlength: [1000, 'Admin response cannot exceed 1000 characters']
  },
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Usually an admin
  },
  respondedAt: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
