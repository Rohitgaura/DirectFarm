const express = require('express');
const router = express.Router();
const Negotiation = require('../models/Negotiation');
const Notification = require('../models/Notification');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// Create a negotiation offer
router.post('/', protect, async (req, res) => {
    try {
        const { productId, offeredPrice, quantity } = req.body;
        const buyerId = req.user.id;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const negotiation = new Negotiation({
            buyerId,
            farmerId: product.farmerId,
            productId,
            offeredPrice,
            quantity
        });

        await negotiation.save();
        console.log('Negotiation created:', negotiation._id, 'for buyer:', buyerId);
        console.log('Product:', product.name, 'Owner (FarmerId):', product.farmerId);

        // Create notification for farmer
        const notification = new Notification({
            recipientId: product.farmerId,
            type: 'negotiation',
            message: `New offer received for ${product.name}: ${quantity}kg at ₹${offeredPrice}/kg`,
            relatedId: negotiation._id
        });

        await notification.save();

        res.status(201).json({ success: true, data: negotiation });
    } catch (error) {
        console.error('Error creating negotiation:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get negotiations for farmer
router.get('/farmer', protect, async (req, res) => {
    try {
        const negotiations = await Negotiation.find({ farmerId: req.user.id })
            .populate('buyerId', 'name email')
            .populate('productId', 'name')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: negotiations });
    } catch (error) {
        console.error('Error fetching negotiations:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get negotiations for buyer
router.get('/buyer', protect, async (req, res) => {
    try {
        console.log('Fetching negotiations for buyer:', req.user.id);
        const negotiations = await Negotiation.find({ buyerId: req.user.id })
            .populate('farmerId', 'name email')
            .populate('productId', 'name')
            .sort({ createdAt: -1 });

        console.log('Found negotiations:', negotiations.length);
        res.json({ success: true, data: negotiations });
    } catch (error) {
        console.error('Error fetching negotiations (populated):', error);
        try {
            // Fallback to simple query
            const simpleNegotiations = await Negotiation.find({ buyerId: req.user.id }).sort({ createdAt: -1 });
            console.log('Found negotiations (simple):', simpleNegotiations.length);
            res.json({ success: true, data: simpleNegotiations });
        } catch (simpleError) {
            console.error('Error fetching negotiations (simple):', simpleError);
            res.status(500).json({ success: false, message: error.message });
        }
    }
});

// Get single negotiation by ID
router.get('/:id', protect, async (req, res) => {
    try {
        const negotiation = await Negotiation.findById(req.params.id)
            .populate('buyerId', 'name email')
            .populate('farmerId', 'name email')
            .populate('productId', 'name price image');

        if (!negotiation) {
            return res.status(404).json({ success: false, message: 'Negotiation not found' });
        }

        // Verify access rights
        if (negotiation.buyerId._id.toString() !== req.user.id && negotiation.farmerId._id.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        console.log('Sending negotiation data:', negotiation);
        res.json({ success: true, data: negotiation });
    } catch (error) {
        console.error('Error fetching negotiation:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update negotiation status
router.put('/:id', protect, async (req, res) => {
    try {
        const { status, counterOfferPrice } = req.body;
        const negotiation = await Negotiation.findById(req.params.id);

        if (!negotiation) {
            return res.status(404).json({ success: false, message: 'Negotiation not found' });
        }

        // Verify ownership (only farmer can accept/reject/counter)
        if (negotiation.farmerId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        negotiation.status = status;
        if (counterOfferPrice) {
            negotiation.counterOfferPrice = counterOfferPrice;
        }

        await negotiation.save();

        // Notify buyer
        let message = `Your offer for ${negotiation.quantity}kg was ${status}`;
        if (status === 'counter_offer') {
            message = `Farmer proposed a new price: ₹${counterOfferPrice}/kg`;
        }

        // Fetch product to get name
        const product = await Product.findById(negotiation.productId);

        const notification = new Notification({
            recipientId: negotiation.buyerId,
            type: 'negotiation_update',
            message: message,
            relatedId: negotiation._id,
            metadata: {
                status: status,
                negotiationId: negotiation._id,
                productId: negotiation.productId,
                productName: product ? product.name : 'Product',
                quantity: negotiation.quantity,
                price: status === 'accepted' ? negotiation.offeredPrice : (negotiation.counterOfferPrice || negotiation.offeredPrice)
            }
        });
        await notification.save();

        res.json({ success: true, data: negotiation });
    } catch (error) {
        console.error('Error updating negotiation:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Delete negotiation (buyer only)
router.delete('/:id', protect, async (req, res) => {
    try {
        const negotiation = await Negotiation.findById(req.params.id);

        if (!negotiation) {
            return res.status(404).json({ success: false, message: 'Negotiation not found' });
        }

        // Verify ownership (only buyer who created the negotiation can delete it)
        if (negotiation.buyerId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this negotiation' });
        }

        // Delete related notifications for this negotiation
        await Notification.deleteMany({
            relatedId: negotiation._id,
            type: { $in: ['negotiation', 'negotiation_update'] }
        });

        // Delete the negotiation
        await Negotiation.findByIdAndDelete(req.params.id);

        res.json({ success: true, message: 'Negotiation deleted successfully' });
    } catch (error) {
        console.error('Error deleting negotiation:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
