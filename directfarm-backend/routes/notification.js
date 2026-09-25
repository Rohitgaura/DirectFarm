const express = require('express');
const router = express.Router();
const { Notification, Negotiation } = require('../models');
const { protect } = require('../middleware/auth');

// Get notifications for user
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { recipientId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 30
    });

    res.json({ success: true, data: notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Mark all notifications for a specific product as read
router.put('/read-by-product/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;

    const unreadNotifs = await Notification.findAll({
      where: {
        recipientId: req.user.id,
        read: false
      }
    });

    // Also get all negotiation IDs belonging to this product
    const negotiations = await Negotiation.findAll({
      where: { productId },
      attributes: ['id']
    });
    const negIds = new Set(negotiations.map(n => String(n.id)));

    let updatedCount = 0;
    for (const notif of unreadNotifs) {
      const metaPid = notif.metadata?.productId || notif.metadata?.product_id;
      const isRelatedNegotiation = notif.relatedId && negIds.has(String(notif.relatedId));

      if (String(metaPid) === String(productId) || isRelatedNegotiation) {
        notif.read = true;
        await notif.save();
        updatedCount++;
      }
    }

    res.json({
      success: true,
      count: updatedCount,
      message: `${updatedCount} product notifications marked as read`
    });
  } catch (error) {
    console.error('Error marking product notifications as read:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Mark all notifications as read for current user
router.put('/read-all', protect, async (req, res) => {
  try {
    await Notification.update(
      { read: true },
      { where: { recipientId: req.user.id, read: false } }
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Mark single notification as read
router.put('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: {
        id: req.params.id,
        recipientId: req.user.id
      }
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();

    res.json({ success: true, data: notification });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
