const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Order = require('../models/Order');

const router = express.Router();

// @route   GET /api/buyers/:id/orders
// @desc    Get buyer's order history
// @access  Private (Buyer only)
router.get('/:id/orders', protect, async (req, res) => {
  try {
    // Check if user is the buyer or admin
    if (req.params.id !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these orders'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ buyer: req.params.id })
      .populate('farmer', 'name email phone')
      .populate('items.product', 'name price images category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments({ buyer: req.params.id });

    res.json({
      success: true,
      count: orders.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: orders
    });
  } catch (error) {
    console.error('Get buyer orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/buyers/:id/dashboard
// @desc    Get buyer dashboard data
// @access  Private (Buyer only)
router.get('/:id/dashboard', protect, async (req, res) => {
  try {
    // Check if user is the buyer
    if (req.params.id !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this dashboard'
      });
    }

    // Get recent orders
    const recentOrders = await Order.find({ buyer: req.params.id })
      .populate('farmer', 'name email phone')
      .populate('items.product', 'name price images')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get order statistics
    const orderStats = await Order.aggregate([
      { $match: { buyer: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Get total spent
    const totalSpent = await Order.aggregate([
      { $match: { buyer: req.user._id, status: 'delivered' } },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Get favorite farmers (most ordered from)
    const favoriteFarmers = await Order.aggregate([
      { $match: { buyer: req.user._id } },
      {
        $group: {
          _id: '$farmer',
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' }
        }
      },
      { $sort: { orderCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'farmer'
        }
      },
      { $unwind: '$farmer' },
      {
        $project: {
          farmer: {
            _id: 1,
            name: 1,
            email: 1,
            phone: 1
          },
          orderCount: 1,
          totalSpent: 1
        }
      }
    ]);

    // Get monthly spending for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlySpending = await Order.aggregate([
      {
        $match: {
          buyer: req.user._id,
          createdAt: { $gte: sixMonthsAgo },
          status: 'delivered'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          spending: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        recentOrders,
        orderStats,
        totalSpent: totalSpent[0]?.total || 0,
        favoriteFarmers,
        monthlySpending
      }
    });
  } catch (error) {
    console.error('Get buyer dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/buyers/:id/profile
// @desc    Get buyer profile
// @access  Private (Buyer only)
router.get('/:id/profile', protect, async (req, res) => {
  try {
    // Check if user is the buyer
    if (req.params.id !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this profile'
      });
    }

    const buyer = await User.findById(req.params.id).select('-password');

    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: 'Buyer not found'
      });
    }

    res.json({
      success: true,
      data: { buyer }
    });
  } catch (error) {
    console.error('Get buyer profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
