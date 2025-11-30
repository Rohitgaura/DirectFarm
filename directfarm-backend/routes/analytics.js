const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// Helper to get last 6 months labels
const getLast6Months = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        months.push(d.toLocaleString('default', { month: 'short' }));
    }
    return months;
};

// @desc    Get Admin Analytics
// @route   GET /api/analytics/admin
// @access  Private/Admin
router.get('/admin', protect, authorize('admin'), async (req, res) => {
    try {
        // 1. User Growth (Mock data for now as we don't track historical user counts easily without time-series db)
        // In a real app, we'd aggregate User.createdAt
        const userGrowth = [
            { name: 'Jan', users: 120 },
            { name: 'Feb', users: 150 },
            { name: 'Mar', users: 200 },
            { name: 'Apr', users: 280 },
            { name: 'May', users: 350 },
            { name: 'Jun', users: 450 },
        ];

        // 2. Revenue Trends (Aggregate orders by month)
        // Simplified: Fetch all orders and group by month
        const orders = await Order.find({ status: { $ne: 'cancelled' } });
        const revenueData = {};

        orders.forEach(order => {
            const date = new Date(order.createdAt);
            const month = date.toLocaleString('default', { month: 'short' });
            revenueData[month] = (revenueData[month] || 0) + order.totalAmount;
        });

        const revenueChart = getLast6Months().map(month => ({
            name: month,
            revenue: revenueData[month] || 0
        }));

        // 3. Order Status Distribution
        const orderStats = await Order.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        res.json({
            success: true,
            data: {
                userGrowth,
                revenueChart,
                orderStats
            }
        });
    } catch (error) {
        console.error('Error fetching admin analytics:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @desc    Get Farmer Analytics
// @route   GET /api/analytics/farmer
// @access  Private/Farmer
router.get('/farmer', protect, authorize('farmer'), async (req, res) => {
    try {
        const farmerId = req.user.id;

        // 1. Monthly Income
        // Find orders containing products from this farmer
        // Note: Order model structure might need population to filter by farmer's products
        // For simplicity, assuming we can get products first then find orders
        const products = await Product.find({ farmerId: farmerId });
        const productIds = products.map(p => p._id);

        // This is a simplified aggregation. In a real app, Order items should store farmerId.
        // We'll assume for now we fetch all orders and filter in memory (not efficient for scale but works for MVP)
        const allOrders = await Order.find({ status: { $ne: 'cancelled' } }).populate('items.product');

        const incomeData = {};
        let totalIncome = 0;

        allOrders.forEach(order => {
            let orderIncome = 0;
            order.items.forEach(item => {
                if (item.product && item.product.farmerId && item.product.farmerId.toString() === farmerId) {
                    orderIncome += item.price * item.quantity;
                }
            });

            if (orderIncome > 0) {
                const date = new Date(order.createdAt);
                const month = date.toLocaleString('default', { month: 'short' });
                incomeData[month] = (incomeData[month] || 0) + orderIncome;
                totalIncome += orderIncome;
            }
        });

        const incomeChart = getLast6Months().map(month => ({
            name: month,
            income: incomeData[month] || 0
        }));

        // 2. Top Products
        const productSales = {};
        allOrders.forEach(order => {
            order.items.forEach(item => {
                if (item.product && item.product.farmerId && item.product.farmerId.toString() === farmerId) {
                    const pName = item.product.name;
                    productSales[pName] = (productSales[pName] || 0) + item.quantity;
                }
            });
        });

        const topProducts = Object.keys(productSales)
            .map(key => ({ name: key, sales: productSales[key] }))
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 5);

        res.json({
            success: true,
            data: {
                incomeChart,
                topProducts,
                totalIncome
            }
        });
    } catch (error) {
        console.error('Error fetching farmer analytics:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @desc    Get Buyer Analytics
// @route   GET /api/analytics/buyer
// @access  Private/Buyer
router.get('/buyer', protect, authorize('buyer'), async (req, res) => {
    try {
        const buyerId = req.user.id;

        // 1. Monthly Spending
        const orders = await Order.find({ buyer: buyerId, status: { $ne: 'cancelled' } });

        const spendingData = {};
        let totalSpent = 0;
        let totalSaved = 0; // Mock calculation: assume market price is 20% higher

        orders.forEach(order => {
            const date = new Date(order.createdAt);
            const month = date.toLocaleString('default', { month: 'short' });
            spendingData[month] = (spendingData[month] || 0) + order.totalAmount;

            totalSpent += order.totalAmount;
            totalSaved += (order.totalAmount * 0.2); // Mock 20% savings
        });

        const spendingChart = getLast6Months().map(month => ({
            name: month,
            spent: spendingData[month] || 0
        }));

        // 2. Category Distribution (Mock)
        const categoryData = [
            { name: 'Vegetables', value: 45 },
            { name: 'Fruits', value: 30 },
            { name: 'Grains', value: 15 },
            { name: 'Others', value: 10 },
        ];

        res.json({
            success: true,
            data: {
                spendingChart,
                categoryData,
                totalSpent,
                totalSaved
            }
        });
    } catch (error) {
        console.error('Error fetching buyer analytics:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
