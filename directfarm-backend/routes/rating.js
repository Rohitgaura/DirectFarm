const express = require('express');
const router = express.Router();
const { Op, fn, col } = require('sequelize');
const { Rating, Order, OrderItem, Farmer, Buyer, User } = require('../models');
const { protect } = require('../middleware/auth');

// @desc    Submit a rating
// @route   POST /api/ratings
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { orderId, rating, review } = req.body;
    const raterId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const order = await Order.findByPk(orderId, {
      include: [{ model: OrderItem, as: 'items' }]
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({ success: false, message: 'You can only rate completed orders' });
    }

    let ratedUserId;
    let role;
    let isBuyerRating = false;

    if (order.buyerId === raterId) {
      ratedUserId = order.farmerId || (order.items && order.items.length > 0 ? order.items[0].farmerId : null);
      role = 'farmer';
      isBuyerRating = true;

      if (order.isRatedByBuyer) {
        return res.status(400).json({ success: false, message: 'You have already rated this order' });
      }
    } else {
      const isFarmer = order.farmerId === raterId || (order.items && order.items.some(item => item.farmerId === raterId));
      if (!isFarmer) {
        return res.status(403).json({ success: false, message: 'Not authorized to rate this order' });
      }

      ratedUserId = order.buyerId;
      role = 'buyer';

      if (order.isRatedBySeller) {
        return res.status(400).json({ success: false, message: 'You have already rated this order' });
      }
    }

    const newRating = await Rating.create({
      orderId,
      ratedBy: raterId,
      ratedUser: ratedUserId,
      rating: parseFloat(rating),
      review: review || '',
      role
    });

    if (isBuyerRating) {
      order.isRatedByBuyer = true;
    } else {
      order.isRatedBySeller = true;
    }
    await order.save();

    // Recalculate average rating for the rated user
    const stats = await Rating.findAll({
      where: { ratedUser: ratedUserId, role },
      attributes: [
        [fn('AVG', col('rating')), 'avgRating'],
        [fn('COUNT', col('id')), 'numRatings']
      ],
      raw: true
    });

    if (stats.length > 0) {
      const avgRating = parseFloat(stats[0].avgRating) || 0;
      const numRatings = parseInt(stats[0].numRatings, 10) || 0;

      await User.update(
        { averageRating: avgRating, totalRatings: numRatings },
        { where: { id: ratedUserId } }
      );

      const Model = role === 'farmer' ? Farmer : Buyer;
      await Model.update(
        { averageRating: avgRating, totalRatings: numRatings },
        { where: { userId: ratedUserId } }
      );
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
    const ratings = await Rating.findAll({
      where: { ratedUser: req.params.userId },
      include: [{ model: User, as: 'rater', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']]
    });

    const formattedRatings = ratings.map(r => {
      const json = r.toJSON();
      if (r.rater) json.ratedBy = r.rater.toJSON();
      return json;
    });

    res.json({ success: true, data: formattedRatings });
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
    const { role } = req.query;

    if (!role || (role !== 'farmer' && role !== 'buyer')) {
      return res.status(400).json({ success: false, message: 'Role is required (farmer or buyer)' });
    }

    const Model = role === 'farmer' ? Farmer : Buyer;

    const topRated = await Model.findAll({
      where: { totalRatings: { [Op.gt]: 0 } },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'location'] }],
      order: [['averageRating', 'DESC'], ['totalRatings', 'DESC']],
      limit: 10
    });

    res.json({ success: true, data: topRated });
  } catch (error) {
    console.error('Error fetching top rated users:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
