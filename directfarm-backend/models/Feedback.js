const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  name: {
    type: String,
    required: false
  },
  email: {
    type: String,
    required: false
  },
  phone: {
    type: String,
    required: false
  },
  type: {
    type: String,
    enum: ['feedback', 'complaint', 'suggestion'],
    default: 'feedback'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  subject: {
    type: String,
    required: [true, 'Please add a subject'],
    trim: true,
    maxlength: [100, 'Subject can not be more than 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Please add a message'],
    maxlength: [1000, 'Message can not be more than 1000 characters']
  },
  status: {
    type: String,
    enum: ['new', 'read', 'in-progress', 'resolved'],
    default: 'new'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Validate that contact info is present if user is not logged in
FeedbackSchema.pre('save', function (next) {
  if (!this.user && (!this.email || !this.phone)) {
    return next(new Error('Email and Phone are required for guest feedback'));
  }
  next();
});

module.exports = mongoose.model('Feedback', FeedbackSchema);
