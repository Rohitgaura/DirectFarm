const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Order, OrderItem, Product, User } = require('../models');
const { protect, authorize } = require('../middleware/auth');

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
    const userGrowth = [
      { name: 'Jan', users: 120 },
      { name: 'Feb', users: 150 },
      { name: 'Mar', users: 200 },
      { name: 'Apr', users: 280 },
      { name: 'May', users: 350 },
      { name: 'Jun', users: 450 }
    ];

    const orders = await Order.findAll({ where: { status: { [Op.ne]: 'cancelled' } } });
    const revenueData = {};

    orders.forEach(order => {
      const date = new Date(order.createdAt);
      const month = date.toLocaleString('default', { month: 'short' });
      revenueData[month] = (revenueData[month] || 0) + (order.totalAmount || 0);
    });

    const revenueChart = getLast6Months().map(month => ({
      name: month,
      revenue: revenueData[month] || 0
    }));

    const allOrders = await Order.findAll();
    const orderStats = [
      { _id: 'pending', count: allOrders.filter(o => o.status === 'pending').length },
      { _id: 'confirmed', count: allOrders.filter(o => o.status === 'confirmed').length },
      { _id: 'delivered', count: allOrders.filter(o => o.status === 'delivered').length },
      { _id: 'cancelled', count: allOrders.filter(o => o.status === 'cancelled').length }
    ];

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

    // 1. Fetch Farmer Products (Crop Inventory & Upload Analytics)
    const products = await Product.findAll({
      where: { farmerId },
      order: [['createdAt', 'DESC']]
    });

    const today = new Date();
    const isToday = (d) => {
      if (!d) return false;
      const date = new Date(d);
      return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
    };

    let totalCrops = products.length;
    let totalStockKg = 0;
    let totalStockValue = 0;
    let uploadedTodayCount = 0;
    let uploadedTodayKg = 0;

    const categoryMap = {};
    const cropQuantityChart = [];

    products.forEach(p => {
      const qty = parseFloat(p.quantity) || 0;
      const price = parseFloat(p.pricePerKg || p.price) || 0;
      const value = qty * price;
      const cat = p.category || 'Vegetables';

      totalStockKg += qty;
      totalStockValue += value;

      if (isToday(p.createdAt)) {
        uploadedTodayCount++;
        uploadedTodayKg += qty;
      }

      categoryMap[cat] = categoryMap[cat] || { name: cat, quantity: 0, count: 0, value: 0 };
      categoryMap[cat].quantity += qty;
      categoryMap[cat].count += 1;
      categoryMap[cat].value += value;

      cropQuantityChart.push({
        id: p.id,
        name: p.name,
        category: cat,
        quantity: qty,
        pricePerKg: price,
        totalValue: value,
        createdAt: p.createdAt
      });
    });

    const categoryQuantityChart = Object.values(categoryMap);

    // Monthly uploads of crops and quantity
    const uploadMonthlyMap = {};
    products.forEach(p => {
      const date = new Date(p.createdAt);
      const month = date.toLocaleString('default', { month: 'short' });
      uploadMonthlyMap[month] = uploadMonthlyMap[month] || { name: month, cropsCount: 0, quantityKg: 0 };
      uploadMonthlyMap[month].cropsCount += 1;
      uploadMonthlyMap[month].quantityKg += (parseFloat(p.quantity) || 0);
    });

    const uploadTimelineChart = getLast6Months().map(month => ({
      name: month,
      cropsCount: uploadMonthlyMap[month] ? uploadMonthlyMap[month].cropsCount : 0,
      quantityKg: uploadMonthlyMap[month] ? uploadMonthlyMap[month].quantityKg : 0
    }));

    // 2. Fetch Orders & Sales
    const orders = await Order.findAll({
      where: {
        farmerId,
        status: { [Op.ne]: 'cancelled' }
      },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['id', 'name'] }]
        }
      ]
    });

    const incomeData = {};
    let totalIncome = 0;
    const productSales = {};

    orders.forEach(order => {
      const date = new Date(order.createdAt);
      const month = date.toLocaleString('default', { month: 'short' });
      incomeData[month] = (incomeData[month] || 0) + (order.totalAmount || 0);
      totalIncome += (order.totalAmount || 0);

      if (order.items) {
        order.items.forEach(item => {
          const pName = item.product ? item.product.name : 'Product';
          productSales[pName] = (productSales[pName] || 0) + item.quantity;
        });
      }
    });

    const incomeChart = getLast6Months().map(month => ({
      name: month,
      income: incomeData[month] || 0
    }));

    const topProducts = Object.keys(productSales)
      .map(key => ({ name: key, sales: productSales[key] }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        // Crop Inventory & Upload Analytics
        totalCrops,
        totalStockKg,
        totalStockValue,
        uploadedTodayCount,
        uploadedTodayKg,
        cropQuantityChart,
        categoryQuantityChart,
        uploadTimelineChart,
        // Orders & Income Analytics
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

    const orders = await Order.findAll({
      where: {
        buyerId,
        status: { [Op.ne]: 'cancelled' }
      }
    });

    const spendingData = {};
    let totalSpent = 0;

    orders.forEach(order => {
      const date = new Date(order.createdAt);
      const month = date.toLocaleString('default', { month: 'short' });
      spendingData[month] = (spendingData[month] || 0) + (order.totalAmount || 0);
      totalSpent += (order.totalAmount || 0);
    });

    const spendingChart = getLast6Months().map(month => ({
      name: month,
      spent: spendingData[month] || 0
    }));

    const categoryData = [
      { name: 'Vegetables', value: 45 },
      { name: 'Fruits', value: 30 },
      { name: 'Grains', value: 15 },
      { name: 'Others', value: 10 }
    ];

    res.json({
      success: true,
      data: {
        spendingChart,
        categoryData,
        totalSpent,
        totalSaved: totalSpent * 0.2
      }
    });
  } catch (error) {
    console.error('Error fetching buyer analytics:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
