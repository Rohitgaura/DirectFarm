const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { Order, OrderItem, Product, User } = require('../models');

const router = express.Router();

// Helper to format order for response
const formatOrder = (order) => {
  if (!order) return null;
  const json = order.toJSON();
  json.buyer = json.buyer || (order.buyer ? order.buyer.toJSON() : null);
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

// @route   GET /api/orders
// @desc    Get orders (buyer's orders or farmer's orders)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const where = {};

    if (req.user.role === 'buyer') {
      where.buyerId = req.user.id;
    } else if (req.user.role === 'farmer') {
      where.farmerId = req.user.id;
    }

    if (req.query.status) {
      where.status = req.query.status;
    }

    if (req.query.paymentStatus) {
      where.paymentStatus = req.query.paymentStatus;
    }

    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      include: [
        { model: User, as: 'buyer', attributes: ['id', 'name', 'email', 'phone'] },
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
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: User, as: 'buyer', attributes: ['id', 'name', 'email', 'phone', 'address'] },
        { model: User, as: 'farmer', attributes: ['id', 'name', 'email', 'phone', 'address'] },
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'pricePerKg', 'images', 'category'] }]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.buyerId !== req.user.id && order.farmerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.json({
      success: true,
      data: { order: formatOrder(order) }
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/orders
// @desc    Create new order
// @access  Private (Buyers only)
router.post('/', protect, authorize('buyer'), [
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('shippingAddress')
    .isObject()
    .withMessage('Shipping address is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { items, shippingAddress, notes, paymentMethod } = req.body;

    let subtotal = 0;
    const validatedItems = [];
    let detectedFarmerId = null;

    for (const item of items) {
      const productId = item.product || item.productId;
      const product = await Product.findByPk(productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found`
        });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient quantity for ${product.name}`
        });
      }

      if (!detectedFarmerId) {
        detectedFarmerId = product.farmerId;
      }

      const price = product.pricePerKg;
      const itemTotal = price * item.quantity;
      subtotal += itemTotal;

      validatedItems.push({
        productId: product.id,
        farmerId: product.farmerId,
        quantity: item.quantity,
        price
      });
    }

    const shippingCost = subtotal > 1000 ? 0 : 100;
    const totalAmount = subtotal + shippingCost;

    const order = await Order.create({
      buyerId: req.user.id,
      farmerId: detectedFarmerId,
      totalAmount,
      shippingAddress,
      notes,
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: 'pending',
      status: 'pending'
    });

    for (const item of validatedItems) {
      await OrderItem.create({
        orderId: order.id,
        productId: item.productId,
        farmerId: item.farmerId,
        quantity: item.quantity,
        price: item.price
      });

      // Deduct product quantity
      const prod = await Product.findByPk(item.productId);
      if (prod) {
        await prod.update({ quantity: Math.max(0, prod.quantity - item.quantity) });
      }
    }

    const populatedOrder = await Order.findByPk(order.id, {
      include: [
        { model: User, as: 'buyer', attributes: ['id', 'name', 'email', 'phone'] },
        { model: User, as: 'farmer', attributes: ['id', 'name', 'email', 'phone'] },
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'pricePerKg', 'images'] }]
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order: formatOrder(populatedOrder) }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during order creation'
    });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private (Order participants or admin)
router.put('/:id/status', protect, [
  body('status')
    .isIn(['pending', 'confirmed', 'delivered', 'cancelled'])
    .withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const order = await Order.findByPk(req.params.id, {
      include: [{ model: OrderItem, as: 'items' }]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const isAuthorized =
      order.buyerId === req.user.id ||
      order.farmerId === req.user.id ||
      req.user.role === 'admin';

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order'
      });
    }

    const { status, notes } = req.body;
    const oldStatus = order.status;

    order.status = status;
    if (notes) order.notes = notes;

    // Restore stock if cancelled
    if (status === 'cancelled' && oldStatus !== 'cancelled' && order.items) {
      for (const item of order.items) {
        const prod = await Product.findByPk(item.productId);
        if (prod) {
          await prod.update({ quantity: prod.quantity + item.quantity });
        }
      }
    }

    await order.save();

    const updatedOrder = await Order.findByPk(order.id, {
      include: [
        { model: User, as: 'buyer', attributes: ['id', 'name', 'email', 'phone'] },
        { model: User, as: 'farmer', attributes: ['id', 'name', 'email', 'phone'] },
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'pricePerKg', 'images'] }]
        }
      ]
    });

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order: formatOrder(updatedOrder) }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during status update'
    });
  }
});

module.exports = router;
