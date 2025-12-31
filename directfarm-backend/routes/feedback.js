const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const { protect } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

// @route   POST /api/feedback
// @desc    Submit feedback/complaint/suggestion
// @access  Public
router.post('/', async (req, res) => {
    try {
        let userId = null;

        // Check for token manually to handle optional auth
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            try {
                const token = req.headers.authorization.split(' ')[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded.id;
            } catch (err) {
                // Token invalid or expired, treat as guest
                console.log('Feedback submission: Token invalid, treating as guest');
            }
        }

        const { type, priority, subject, message, email, phone, name } = req.body;

        const feedbackData = {
            type,
            priority,
            subject,
            message
        };

        if (userId) {
            feedbackData.user = userId;
        } else {
            // For guest users, require email and phone
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
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
