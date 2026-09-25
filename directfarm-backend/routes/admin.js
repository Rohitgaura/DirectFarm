const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { User, Product, Order, LoginLog } = require('../models');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get system statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const totalUsers = await User.count({ where: { role: { [Op.ne]: 'admin' } } });
    const totalFarmers = await User.count({ where: { role: 'farmer' } });
    const totalBuyers = await User.count({ where: { role: 'buyer' } });
    const totalProducts = await Product.count();
    const totalOrders = await Order.count();

    const orders = await Order.findAll({ where: { status: { [Op.ne]: 'cancelled' } } });
    const totalRevenue = orders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);

    const recentUsers = await User.findAll({
      where: { role: { [Op.ne]: 'admin' } },
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'name', 'email', 'role', 'createdAt']
    });

    const recentProducts = await Product.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
      include: [{ model: User, as: 'farmer', attributes: ['id', 'name'] }]
    });

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          farmers: totalFarmers,
          buyers: totalBuyers
        },
        products: totalProducts,
        orders: totalOrders,
        revenue: totalRevenue,
        recentUsers,
        recentProducts
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.findAll({
      where: { role: { [Op.ne]: 'admin' } },
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
router.delete('/users/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot delete admin user' });
    }

    await user.destroy();

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get all products
// @route   GET /api/admin/products
// @access  Private/Admin
router.get('/products', protect, authorize('admin'), async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [{ model: User, as: 'farmer', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']]
    });

    const formattedProducts = products.map(p => {
      const json = p.toJSON();
      if (p.farmer) json.farmerId = p.farmer.toJSON();
      return json;
    });

    res.json({ success: true, data: formattedProducts });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
router.delete('/products/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await product.destroy();

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Create initial admin user (Development only)
// @route   POST /api/admin/create-seed
// @access  Public
router.post('/create-seed', async (req, res) => {
  try {
    const adminExists = await User.findOne({ where: { role: 'admin' } });
    if (adminExists) {
      return res.status(400).json({ success: false, message: 'Admin already exists' });
    }

    const { name, email, password, phone } = req.body;

    const user = await User.create({
      name: name || 'Admin User',
      email: email || 'admin@directfarm.com',
      password: password || 'admin123',
      phone: phone || '1234567890',
      role: 'admin',
      address: 'Admin HQ'
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user.id,
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error creating seed admin:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get login logs
// @route   GET /api/admin/login-logs
// @access  Private/Admin
router.get('/login-logs', protect, authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const offset = (page - 1) * limit;

    const { count, rows: logs } = await LoginLog.findAndCountAll({
      order: [['loginAt', 'DESC']],
      limit,
      offset
    });

    res.json({
      success: true,
      count: logs.length,
      total: count,
      page,
      pages: Math.ceil(count / limit),
      data: logs
    });
  } catch (error) {
    console.error('Error fetching login logs:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
