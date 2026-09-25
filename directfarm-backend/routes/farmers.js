const express = require('express');
const { Op } = require('sequelize');
const { protect } = require('../middleware/auth');
const { User, Product, Order, OrderItem } = require('../models');

const router = express.Router();

// Helper to format order for response
const formatOrder = (order) => {
  if (!order) return null;
  const json = order.toJSON();
  json.buyer = json.buyer || (order.buyer ? order.buyer.toJSON() : null);
  if (order.items) {
    json.items = order.items.map(item => {
      const itemJson = item.toJSON();
      itemJson.product = item.product ? item.product.toJSON() : null;
      return itemJson;
    });
  }
  return json;
};

// @route   GET /api/farmers
// @desc    Get all farmers
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: farmers } = await User.findAndCountAll({
      where: { role: 'farmer' },
      attributes: ['id', 'name', 'email', 'phone', 'address', 'averageRating', 'totalRatings', 'experienceYears', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    res.json({
      success: true,
      count: farmers.length,
      total: count,
      page,
      pages: Math.ceil(count / limit),
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
      where: {
        id: req.params.id,
        role: 'farmer'
      }
    });

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    const products = await Product.findAll({
      where: {
        farmerId: req.params.id,
        quantity: { [Op.gt]: 0 }
      },
      order: [['createdAt', 'DESC']]
    });

    // Orders statistics
    const orders = await Order.findAll({
      where: { farmerId: farmer.id }
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const completedOrders = orders.filter(o => o.status === 'delivered').length;

    const stats = {
      totalOrders,
      totalRevenue,
      completedOrders
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
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: products } = await Product.findAndCountAll({
      where: {
        farmerId: req.params.id,
        quantity: { [Op.gt]: 0 }
      },
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    res.json({
      success: true,
      count: products.length,
      total: count,
      page,
      pages: Math.ceil(count / limit),
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
    if (req.params.id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these orders'
      });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: orders } = await Order.findAndCountAll({
      where: { farmerId: req.params.id },
      include: [
        { model: User, as: 'buyer', attributes: ['id', 'name', 'email', 'phone'] },
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'pricePerKg', 'images'] }]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    const formattedOrders = orders.map(formatOrder);

    res.json({
      success: true,
      count: formattedOrders.length,
      total: count,
      page,
      pages: Math.ceil(count / limit),
      data: formattedOrders
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
    if (req.params.id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this dashboard'
      });
    }

    const recentOrders = await Order.findAll({
      where: { farmerId: req.params.id },
      include: [
        { model: User, as: 'buyer', attributes: ['id', 'name', 'email', 'phone'] },
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'pricePerKg', 'images'] }]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    const products = await Product.findAll({ where: { farmerId: req.params.id } });
    const totalProducts = products.length;
    const availableProducts = products.filter(p => p.quantity > 0).length;
    const totalValue = products.reduce((sum, p) => sum + (p.pricePerKg * p.quantity), 0);

    const allOrders = await Order.findAll({ where: { farmerId: req.params.id } });
    const orderStats = [
      { _id: 'pending', count: allOrders.filter(o => o.status === 'pending').length },
      { _id: 'confirmed', count: allOrders.filter(o => o.status === 'confirmed').length },
      { _id: 'delivered', count: allOrders.filter(o => o.status === 'delivered').length },
      { _id: 'cancelled', count: allOrders.filter(o => o.status === 'cancelled').length }
    ];

    res.json({
      success: true,
      data: {
        recentOrders: recentOrders.map(formatOrder),
        productStats: {
          totalProducts,
          availableProducts,
          totalValue
        },
        orderStats,
        monthlyRevenue: []
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
