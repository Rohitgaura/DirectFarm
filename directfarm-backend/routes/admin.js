const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get system statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', protect, authorize('admin'), async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
        const totalFarmers = await User.countDocuments({ role: 'farmer' });
        const totalBuyers = await User.countDocuments({ role: 'buyer' });
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();

        // Calculate total revenue (sum of all order totalAmounts)
        const orders = await Order.find({ status: { $ne: 'cancelled' } });
        const totalRevenue = orders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);

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
                revenue: totalRevenue
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
        const users = await User.find({ role: { $ne: 'admin' } })
            .select('-password')
            .sort({ createdAt: -1 });

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
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(400).json({ success: false, message: 'Cannot delete admin user' });
        }

        await user.deleteOne();

        // Also delete related data (products, orders, etc.) - simplified for now
        if (user.role === 'farmer') {
            await Product.deleteMany({ farmer: user._id });
        }

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
        const products = await Product.find()
            .populate('farmerId', 'name email')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: products });
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
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        await product.deleteOne();

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
        const adminExists = await User.findOne({ role: 'admin' });
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
                _id: user._id,
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

module.exports = router;
