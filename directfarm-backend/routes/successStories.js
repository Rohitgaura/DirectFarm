const express = require('express');
const router = express.Router();
const SuccessStory = require('../models/SuccessStory');
const { protect } = require('../middleware/auth');

// Get all approved success stories
router.get('/', async (req, res) => {
    try {
        const stories = await SuccessStory.find({ isApproved: true })
            .sort({ isFeatured: -1, createdAt: -1 })
            .select('-__v');

        res.json({
            success: true,
            data: stories
        });
    } catch (error) {
        console.error('Error fetching success stories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch success stories'
        });
    }
});

// Create new success story (requires authentication)
router.post('/', protect, async (req, res) => {
    try {
        const {
            story,
            beforeIncome,
            currentIncome,
            improvements,
            cropTypes,
            yearsWithPlatform
        } = req.body;

        const successStory = new SuccessStory({
            farmerId: req.user._id,
            farmerName: req.user.name,
            location: {
                village: req.body.village || '',
                district: req.body.district || '',
                state: req.body.state || ''
            },
            story,
            beforeIncome,
            currentIncome,
            improvements: improvements || [],
            cropTypes: cropTypes || [],
            yearsWithPlatform: yearsWithPlatform || 0,
            isApproved: false // Requires admin approval
        });

        await successStory.save();

        res.status(201).json({
            success: true,
            message: 'Success story submitted! It will be reviewed and published soon.',
            data: successStory
        });
    } catch (error) {
        console.error('Error creating success story:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to submit success story'
        });
    }
});

module.exports = router;
