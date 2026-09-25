const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { User, Product, Order } = require('../models');

// @desc    Get public platform statistics (aggregate counts only)
// @route   GET /api/public/stats
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const [totalFarmers, totalBuyers, totalProducts, totalOrders, orders] = await Promise.all([
      User.count({ where: { role: 'farmer' } }),
      User.count({ where: { role: 'buyer' } }),
      Product.count(),
      Order.count(),
      Order.findAll({ where: { status: { [Op.ne]: 'cancelled' } } })
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    res.json({
      success: true,
      data: {
        totalFarmers,
        totalBuyers,
        totalProducts,
        totalOrders,
        totalRevenue,
        totalUsers: totalFarmers + totalBuyers,
        liveUsers: req.io ? req.io.engine.clientsCount : 1
      }
    });
  } catch (error) {
    console.error('Error fetching public stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
