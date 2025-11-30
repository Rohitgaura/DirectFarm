const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// Send a message
router.post('/send', protect, async (req, res) => {
    try {
        const { recipientId, productId, message } = req.body;
        const senderId = req.user.id;

        // Validate recipient exists
        const recipient = await User.findById(recipientId);
        if (!recipient) {
            return res.status(404).json({ success: false, message: 'Recipient not found' });
        }

        // Create message
        const newMessage = new Message({
            senderId,
            recipientId,
            productId: productId || null,
            message
        });

        await newMessage.save();

        // Get product info for notification context
        let productInfo = null;
        if (productId) {
            productInfo = await Product.findById(productId).select('name');
        }

        // Create notification for recipient
        const notificationMessage = productInfo
            ? `New message from ${req.user.name} about ${productInfo.name}`
            : `New message from ${req.user.name}`;

        const notification = new Notification({
            recipientId,
            type: 'chat',
            message: notificationMessage,
            relatedId: newMessage._id,
            metadata: {
                senderId,
                senderName: req.user.name,
                productId: productId || null,
                productName: productInfo?.name || null
            }
        });

        await notification.save();

        // Populate sender info before returning
        await newMessage.populate('senderId', 'name email role');

        res.status(201).json({ success: true, data: newMessage });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get conversation with a specific user
router.get('/conversation/:userId', protect, async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const otherUserId = req.params.userId;

        // Get all messages between these two users
        const messages = await Message.find({
            $or: [
                { senderId: currentUserId, recipientId: otherUserId },
                { senderId: otherUserId, recipientId: currentUserId }
            ]
        })
            .populate('senderId', 'name email role')
            .populate('recipientId', 'name email role')
            .populate('productId', 'name')
            .sort({ createdAt: 1 }); // Oldest first

        // Mark messages from other user as read
        await Message.updateMany(
            {
                senderId: otherUserId,
                recipientId: currentUserId,
                read: false
            },
            { read: true }
        );

        res.json({ success: true, data: messages });
    } catch (error) {
        console.error('Error fetching conversation:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get all conversations (list of users you've chatted with)
router.get('/conversations', protect, async (req, res) => {
    try {
        const userId = req.user.id;

        // Get all unique users who have exchanged messages with current user
        const messages = await Message.find({
            $or: [
                { senderId: userId },
                { recipientId: userId }
            ]
        })
            .populate('senderId', 'name email role')
            .populate('recipientId', 'name email role')
            .populate('productId', 'name')
            .sort({ createdAt: -1 });

        // Group by conversation partner
        const conversations = {};

        messages.forEach(msg => {
            // Skip if sender or recipient user no longer exists (was deleted)
            if (!msg.senderId || !msg.recipientId) {
                return;
            }

            const partnerId = msg.senderId._id.toString() === userId
                ? msg.recipientId._id.toString()
                : msg.senderId._id.toString();

            if (!conversations[partnerId]) {
                const partner = msg.senderId._id.toString() === userId
                    ? msg.recipientId
                    : msg.senderId;

                conversations[partnerId] = {
                    user: partner,
                    lastMessage: msg,
                    unreadCount: 0
                };
            }
        });


        // Count unread messages for each conversation
        for (const partnerId in conversations) {
            const unreadCount = await Message.countDocuments({
                senderId: partnerId,
                recipientId: userId,
                read: false
            });
            conversations[partnerId].unreadCount = unreadCount;
        }

        const conversationList = Object.values(conversations);

        res.json({ success: true, data: conversationList });
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Mark message as read
router.put('/:messageId/read', protect, async (req, res) => {
    try {
        const message = await Message.findById(req.params.messageId);

        if (!message) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }

        // Only recipient can mark as read
        if (message.recipientId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        message.read = true;
        await message.save();

        res.json({ success: true, data: message });
    } catch (error) {
        console.error('Error marking message as read:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
