const express = require('express');
const router = express.Router();
const Rating = require('../models/Rating');
const Order = require('../models/Order');
const Farmer = require('../models/Farmer');
const Buyer = require('../models/Buyer');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @desc    Submit a rating
// @route   POST /api/ratings
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { orderId, rating, review } = req.body;
        const raterId = req.user.id;

        // Validate input
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
        }

        // Check if order exists
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Check if order is delivered
        if (order.status !== 'delivered') {
            return res.status(400).json({ success: false, message: 'You can only rate completed orders' });
        }

        // Determine role and rated user
        let ratedUserId;
        let role; // Role of the person being rated
        let isBuyerRating = false;

        if (order.buyerId.toString() === raterId) {
            // Buyer is rating Farmer (actually, order items might have multiple farmers, but assuming single farmer per order for simplicity or taking first item's farmer)
            // In the Order model, items array has farmerId. Assuming order is split by farmer or we rate the farmer of the first item?
            // The Order model has `items` array. If an order can have items from multiple farmers, we should probably rate per item or split orders.
            // However, usually marketplaces split orders by seller. Let's assume order is specific to one seller or we take the first item's seller.
            // Looking at Order model, `items` has `farmerId`.
            // Let's assume for MVP we rate the farmer of the first item.
            ratedUserId = order.items[0].farmerId;
            role = 'farmer';
            isBuyerRating = true;

            if (order.isRatedByBuyer) {
                return res.status(400).json({ success: false, message: 'You have already rated this order' });
            }
        } else {
            // Farmer is rating Buyer
            // We need to check if the rater is the farmer of any item in the order.
            const isFarmer = order.items.some(item => item.farmerId.toString() === raterId);
            if (!isFarmer) {
                return res.status(403).json({ success: false, message: 'Not authorized to rate this order' });
            }

            ratedUserId = order.buyerId;
            role = 'buyer';

            if (order.isRatedBySeller) {
                return res.status(400).json({ success: false, message: 'You have already rated this order' });
            }
        }

        // Create rating
        const newRating = await Rating.create({
            orderId,
            ratedBy: raterId,
            ratedUser: ratedUserId,
            rating,
            review,
            role
        });

        // Update Order flag
        if (isBuyerRating) {
            order.isRatedByBuyer = true;
        } else {
            order.isRatedBySeller = true;
        }
        await order.save();

        // Update Average Rating for the Rated User
        // We need to find the Farmer or Buyer profile associated with ratedUserId
        let Model = role === 'farmer' ? Farmer : Buyer;

        const profile = await Model.findOne({ userId: ratedUserId });
        if (profile) {
            const stats = await Rating.aggregate([
                {
                    $match: {
                        ratedUser: new mongoose.Types.ObjectId(ratedUserId),
                        role: role
                    }
                },
                {
                    $group: {
                        _id: '$ratedUser',
                        avgRating: { $avg: '$rating' },
                        numRatings: { $sum: 1 }
                    }
                }
            ]);

            if (stats.length > 0) {
                profile.averageRating = stats[0].avgRating;
                profile.totalRatings = stats[0].numRatings;
                await profile.save();

                // Also update User model for easier population
                await User.findByIdAndUpdate(ratedUserId, {
                    averageRating: stats[0].avgRating,
                    totalRatings: stats[0].numRatings
                });
            }
        }

        res.status(201).json({ success: true, data: newRating });
    } catch (error) {
        console.error('Error submitting rating:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @desc    Get ratings for a user
// @route   GET /api/ratings/user/:userId
// @access  Public
router.get('/user/:userId', async (req, res) => {
    try {
        const ratings = await Rating.find({ ratedUser: req.params.userId })
            .populate('ratedBy', 'name')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: ratings });
    } catch (error) {
        console.error('Error fetching ratings:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @desc    Get top rated farmers/buyers
// @route   GET /api/ratings/top-rated
// @access  Public
router.get('/top-rated', async (req, res) => {
    try {
        const { role } = req.query; // 'farmer' or 'buyer'

        if (!role || (role !== 'farmer' && role !== 'buyer')) {
            return res.status(400).json({ success: false, message: 'Role is required (farmer or buyer)' });
        }

        let Model = role === 'farmer' ? Farmer : Buyer;

        const topRated = await Model.find({ totalRatings: { $gt: 0 } })
            .sort({ averageRating: -1, totalRatings: -1 })
            .limit(10)
            .populate('userId', 'name location'); // Populate user details if needed

        res.json({ success: true, data: topRated });
    } catch (error) {
        console.error('Error fetching top rated users:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
const mongoose = require('mongoose');
