const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Negotiation, Notification, Product, User } = require('../models');
const { protect } = require('../middleware/auth');

// Create a negotiation offer
router.post('/', protect, async (req, res) => {
  try {
    const { productId, offeredPrice, quantity } = req.body;
    const buyerId = req.user.id;

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const parsedPrice = parseFloat(offeredPrice);
    const parsedQty = parseFloat(quantity);

    const negotiation = await Negotiation.create({
      buyerId,
      farmerId: product.farmerId,
      productId,
      offeredPrice: parsedPrice,
      quantity: parsedQty
    });

    await Notification.create({
      recipientId: product.farmerId,
      type: 'negotiation',
      message: `New bid received for ${product.name}: ${parsedQty}kg at ₹${parsedPrice}/kg`,
      relatedId: negotiation.id,
      metadata: {
        negotiationId: negotiation.id,
        productId: product.id,
        productName: product.name,
        buyerId: req.user.id,
        buyerName: req.user.name,
        quantity: parsedQty,
        offeredPrice: parsedPrice
      }
    });

    res.status(201).json({ success: true, data: negotiation });
  } catch (error) {
    console.error('Error creating negotiation:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all bids/negotiations for a specific product (Farmer view)
router.get('/product/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Only product owner (farmer) or admin can view all bids
    if (product.farmerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view bids for this product' });
    }

    const bids = await Negotiation.findAll({
      where: { productId },
      include: [
        { model: User, as: 'buyer', attributes: ['id', 'name', 'email', 'phone', 'location'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    const formattedBids = bids.map(b => {
      const json = b.toJSON();
      if (b.buyer) json.buyer = b.buyer.toJSON();
      return json;
    });

    // Calculate bidding statistics
    const totalBids = formattedBids.length;
    const prices = formattedBids.map(b => b.offeredPrice).filter(p => p > 0);
    const highestBid = prices.length > 0 ? Math.max(...prices) : 0;
    const lowestBid = prices.length > 0 ? Math.min(...prices) : 0;
    const averageBid = prices.length > 0 ? (prices.reduce((sum, p) => sum + p, 0) / prices.length).toFixed(2) : 0;
    const totalQuantityDemanded = formattedBids.reduce((sum, b) => sum + (parseFloat(b.quantity) || 0), 0);

    const stats = {
      totalBids,
      highestBid,
      lowestBid,
      averageBid: parseFloat(averageBid),
      totalQuantityDemanded,
      remainingQuantity: product.quantity,
      basePrice: product.pricePerKg
    };

    res.json({
      success: true,
      data: {
        product: product.toJSON(),
        bids: formattedBids,
        stats
      }
    });
  } catch (error) {
    console.error('Error fetching product bids:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get negotiations for farmer
router.get('/farmer', protect, async (req, res) => {
  try {
    const negotiations = await Negotiation.findAll({
      where: { farmerId: req.user.id },
      include: [
        { model: User, as: 'buyer', attributes: ['id', 'name', 'email', 'phone'] },
        { model: Product, as: 'product', attributes: ['id', 'name', 'pricePerKg', 'quantity', 'images', 'category'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    const formatted = negotiations.map(n => {
      const json = n.toJSON();
      if (n.buyer) json.buyerId = n.buyer.toJSON();
      if (n.product) json.productId = n.product.toJSON();
      return json;
    });

    res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Error fetching negotiations:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get negotiations for buyer
router.get('/buyer', protect, async (req, res) => {
  try {
    const negotiations = await Negotiation.findAll({
      where: { buyerId: req.user.id },
      include: [
        { model: User, as: 'farmer', attributes: ['id', 'name', 'email', 'phone'] },
        { model: Product, as: 'product', attributes: ['id', 'name', 'pricePerKg', 'quantity', 'images', 'category'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    const formatted = negotiations.map(n => {
      const json = n.toJSON();
      if (n.farmer) json.farmerId = n.farmer.toJSON();
      if (n.product) json.productId = n.product.toJSON();
      return json;
    });

    res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Error fetching buyer negotiations:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get single negotiation by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const negotiation = await Negotiation.findByPk(req.params.id, {
      include: [
        { model: User, as: 'buyer', attributes: ['id', 'name', 'email', 'phone'] },
        { model: User, as: 'farmer', attributes: ['id', 'name', 'email', 'phone'] },
        { model: Product, as: 'product', attributes: ['id', 'name', 'pricePerKg', 'quantity', 'images', 'category', 'description', 'location'] }
      ]
    });

    if (!negotiation) {
      return res.status(404).json({ success: false, message: 'Negotiation not found' });
    }

    if (negotiation.buyerId !== req.user.id && negotiation.farmerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const json = negotiation.toJSON();
    if (negotiation.buyer) json.buyerId = negotiation.buyer.toJSON();
    if (negotiation.farmer) json.farmerId = negotiation.farmer.toJSON();
    if (negotiation.product) json.productId = negotiation.product.toJSON();

    res.json({ success: true, data: json });
  } catch (error) {
    console.error('Error fetching negotiation:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update negotiation status
router.put('/:id', protect, async (req, res) => {
  try {
    const { status, counterOfferPrice } = req.body;
    const negotiation = await Negotiation.findByPk(req.params.id);

    if (!negotiation) {
      return res.status(404).json({ success: false, message: 'Negotiation not found' });
    }

    if (negotiation.farmerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    negotiation.status = status;
    if (counterOfferPrice) {
      negotiation.counterOfferPrice = parseFloat(counterOfferPrice);
    }

    await negotiation.save();

    let message = `Your offer for ${negotiation.quantity}kg was ${status}`;
    if (status === 'counter_offer') {
      message = `Farmer proposed a new price: ₹${counterOfferPrice}/kg`;
    }

    const product = await Product.findByPk(negotiation.productId);

    await Notification.create({
      recipientId: negotiation.buyerId,
      type: 'negotiation_update',
      message,
      relatedId: negotiation.id,
      metadata: {
        status,
        negotiationId: negotiation.id,
        productId: negotiation.productId,
        productName: product ? product.name : 'Product',
        quantity: negotiation.quantity,
        price: status === 'accepted' ? negotiation.offeredPrice : (negotiation.counterOfferPrice || negotiation.offeredPrice)
      }
    });

    res.json({ success: true, data: negotiation });
  } catch (error) {
    console.error('Error updating negotiation:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete negotiation (buyer only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const negotiation = await Negotiation.findByPk(req.params.id);

    if (!negotiation) {
      return res.status(404).json({ success: false, message: 'Negotiation not found' });
    }

    if (negotiation.buyerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this negotiation' });
    }

    await Notification.destroy({
      where: {
        relatedId: negotiation.id,
        type: { [Op.in]: ['negotiation', 'negotiation_update'] }
      }
    });

    await negotiation.destroy();

    res.json({ success: true, message: 'Negotiation deleted successfully' });
  } catch (error) {
    console.error('Error deleting negotiation:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
