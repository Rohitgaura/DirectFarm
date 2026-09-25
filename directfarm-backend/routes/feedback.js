const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Feedback } = require('../models');


// @route   POST /api/feedback
// @desc    Submit feedback/complaint/suggestion
// @access  Public
router.post('/', async (req, res) => {
  try {
    let userId = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        userId = decoded.id;
      } catch (err) {
        console.log('Feedback submission: Token invalid, treating as guest');
      }
    }

    const { type, priority, subject, message, email, phone, name } = req.body;

    const feedbackData = {
      type: type || 'feedback',
      priority: priority || 'medium',
      subject,
      message
    };

    if (userId) {
      feedbackData.userId = userId;
    } else {
      if (!email || !phone) {
        return res.status(400).json({
          success: false,
          message: 'Email and Phone number are required for guest submissions'
        });
      }
      feedbackData.email = email;
      feedbackData.phone = phone;
      feedbackData.name = name;
    }

    const feedback = await Feedback.create(feedbackData);

    res.status(201).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
