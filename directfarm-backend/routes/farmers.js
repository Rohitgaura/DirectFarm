const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

const router = express.Router();

// @route   GET /api/farmers
// @desc    Get all farmers
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const farmers = await User.find({ role: 'farmer', isActive: true })
      .select('name email phone address isVerified createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments({ role: 'farmer', isActive: true });

    res.json({
      success: true,
      count: farmers.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: farmers
    });
  } catch (error) {
    console.error('Get farmers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/farmers/:id
// @desc    Get farmer profile with products and stats
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const farmer = await User.findOne({ 
      _id: req.params.id, 
      role: 'farmer', 
      isActive: true 
    }).select('-password');

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    // Get farmer's products
    const products = await Product.find({ 
      farmer: req.params.id, 
      isAvailable: true 
    }).sort({ createdAt: -1 });

    // Get farmer's order statistics
    const orderStats = await Order.aggregate([
      { $match: { farmer: farmer._id } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          }
        }
      }
    ]);

    const stats = orderStats[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      completedOrders: 0
    };

    res.json({
      success: true,
      data: {
        farmer,
        products: {
          count: products.length,
          items: products
        },
        stats
      }
    });
  } catch (error) {
    console.error('Get farmer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/farmers/:id/products
// @desc    Get farmer's products
// @access  Public
router.get('/:id/products', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const products = await Product.find({ 
      farmer: req.params.id, 
      isAvailable: true 
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments({ 
      farmer: req.params.id, 
      isAvailable: true 
    });

    res.json({
      success: true,
      count: products.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: products
    });
  } catch (error) {
    console.error('Get farmer products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/farmers/:id/orders
// @desc    Get farmer's orders (farmer only)
// @access  Private
router.get('/:id/orders', protect, async (req, res) => {
  try {
    // Check if user is the farmer or admin
    if (req.params.id !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these orders'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ farmer: req.params.id })
      .populate('buyer', 'name email phone')
      .populate('items.product', 'name price images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments({ farmer: req.params.id });

    res.json({
      success: true,
      count: orders.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: orders
    });
  } catch (error) {
    console.error('Get farmer orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/farmers/:id/dashboard
// @desc    Get farmer dashboard data
// @access  Private (Farmer only)
router.get('/:id/dashboard', protect, async (req, res) => {
  try {
    // Check if user is the farmer
    if (req.params.id !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this dashboard'
      });
    }

    // Get recent orders
    const recentOrders = await Order.find({ farmer: req.params.id })
      .populate('buyer', 'name email phone')
      .populate('items.product', 'name price images')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get product statistics
    const productStats = await Product.aggregate([
      { $match: { farmer: req.user._id } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          availableProducts: { $sum: { $cond: ['$isAvailable', 1, 0] } },
          totalValue: { $sum: { $multiply: ['$price', '$quantity'] } }
        }
      }
    ]);

    // Get order statistics
    const orderStats = await Order.aggregate([
      { $match: { farmer: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Get monthly revenue for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          farmer: req.user._id,
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
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        recentOrders,
        productStats: productStats[0] || {
          totalProducts: 0,
          availableProducts: 0,
          totalValue: 0
        },
        orderStats,
        monthlyRevenue
      }
    });
  } catch (error) {
    console.error('Get farmer dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
