const express = require('express');
const { protect } = require('../middleware/auth');
const { User, Order, OrderItem, Product } = require('../models');

const router = express.Router();

// Helper to format order for response
const formatOrder = (order) => {
  if (!order) return null;
  const json = order.toJSON();
  json.farmer = json.farmer || (order.farmer ? order.farmer.toJSON() : null);
  if (order.items) {
    json.items = order.items.map(item => {
      const itemJson = item.toJSON();
      itemJson.product = item.product ? item.product.toJSON() : null;
      return itemJson;
    });
  }
  return json;
};

// @route   GET /api/buyers/:id/orders
// @desc    Get buyer's order history
// @access  Private (Buyer only)
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
      where: { buyerId: req.params.id },
      include: [
        { model: User, as: 'farmer', attributes: ['id', 'name', 'email', 'phone'] },
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'pricePerKg', 'images', 'category'] }]
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
    if (req.params.id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this dashboard'
      });
    }

    const recentOrders = await Order.findAll({
      where: { buyerId: req.params.id },
      include: [
        { model: User, as: 'farmer', attributes: ['id', 'name', 'email', 'phone'] },
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'pricePerKg', 'images'] }]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    const allOrders = await Order.findAll({
      where: { buyerId: req.params.id },
      include: [{ model: User, as: 'farmer', attributes: ['id', 'name', 'email', 'phone'] }]
    });

    const totalSpent = allOrders
      .filter(o => o.status === 'delivered')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const orderStats = [
      { _id: 'pending', count: allOrders.filter(o => o.status === 'pending').length },
      { _id: 'confirmed', count: allOrders.filter(o => o.status === 'confirmed').length },
      { _id: 'delivered', count: allOrders.filter(o => o.status === 'delivered').length },
      { _id: 'cancelled', count: allOrders.filter(o => o.status === 'cancelled').length }
    ];

    // Find top farmers ordered from
    const farmerCounts = {};
    for (const ord of allOrders) {
      if (ord.farmerId && ord.farmer) {
        if (!farmerCounts[ord.farmerId]) {
          farmerCounts[ord.farmerId] = {
            farmer: ord.farmer.toJSON(),
            orderCount: 0,
            totalSpent: 0
          };
        }
        farmerCounts[ord.farmerId].orderCount += 1;
        farmerCounts[ord.farmerId].totalSpent += (ord.totalAmount || 0);
      }
    }

    const favoriteFarmers = Object.values(farmerCounts).sort((a, b) => b.orderCount - a.orderCount).slice(0, 5);

    res.json({
      success: true,
      data: {
        recentOrders: recentOrders.map(formatOrder),
        orderStats,
        totalSpent,
        favoriteFarmers,
        monthlySpending: []
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
    if (req.params.id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this profile'
      });
    }

    const buyer = await User.findByPk(req.params.id);

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
