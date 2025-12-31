const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const Product = require('../models/Product');

const router = express.Router();

// Trigger restart removed


// @route   GET /api/products
// @desc    Get all products with filtering and pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};

    if (req.query.farmerId) {
      filter.farmerId = req.query.farmerId;
    }

    console.log('🔍 [DEBUG] GET /api/products Filter:', JSON.stringify(filter));

    // Filter by category
    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
    }

    if (req.query.minQuantity || req.query.maxQuantity) {
      filter.quantity = {};
      if (req.query.minQuantity) filter.quantity.$gte = parseFloat(req.query.minQuantity);
      if (req.query.maxQuantity) filter.quantity.$lte = parseFloat(req.query.maxQuantity);
    }

    // Build sort object (default: newest first)
    let sort = { createdAt: -1 };
    if (req.query.sortBy) {
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
      sort = { [req.query.sortBy]: sortOrder };
    }

    // Geolocation filter using $near for distance-based sorting
    // Only apply if we have coordinates AND radius
    if (req.query.latitude && req.query.longitude && req.query.radius) {
      const lat = parseFloat(req.query.latitude);
      const lng = parseFloat(req.query.longitude);
      const radiusInMeters = parseFloat(req.query.radius) * 1000; // Convert km to meters

      // $near requires the field to be indexed with 2dsphere
      filter['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: radiusInMeters
        }
      };
      // $near automatically sorts by distance, so clear default sort
      sort = {};
    } else if (req.query.radius && req.user && req.user.location && req.user.location.coordinates) {
      // Use user's location if available and lat/lng not provided
      const lat = req.user.location.coordinates[1];
      const lng = req.user.location.coordinates[0];
      const radiusInMeters = parseFloat(req.query.radius) * 1000;

      filter['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: radiusInMeters
        }
      };
      sort = {};
    }

    const products = await Product.find(filter)
      .populate('farmerId', 'name email phone averageRating totalRatings')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Create a separate filter for counting because $near is not supported in countDocuments
    const countFilter = { ...filter };
    if (countFilter['location.coordinates'] && countFilter['location.coordinates'].$near) {
      const nearQuery = countFilter['location.coordinates'].$near;
      const lng = nearQuery.$geometry.coordinates[0];
      const lat = nearQuery.$geometry.coordinates[1];
      const maxDistanceMeters = nearQuery.$maxDistance;
      const radiusKm = maxDistanceMeters / 1000;
      const radiusRadians = radiusKm / 6378.1; // Earth radius in km

      countFilter['location.coordinates'] = {
        $geoWithin: {
          $centerSphere: [[lng, lat], radiusRadians]
        }
      };
    }

    const total = await Product.countDocuments(countFilter);

    res.json({
      success: true,
      count: products.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: products
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('farmerId', 'name email phone address');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: { product }
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/products
// @desc    Create new product
// @access  Private (Farmers only)
router.post('/', protect, authorize('farmer'), [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('quantity')
    .isFloat({ min: 0 })
    .withMessage('Quantity must be a positive number'),
  body('description')
    .optional()
    .trim(),
  body('harvestingDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid harvesting date format'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  body('location')
    .optional()
    .isObject()
    .withMessage('Location must be an object')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg).join(', ');
      return res.status(400).json({
        success: false,
        message: errorMessages || 'Validation errors',
        errors: errors.array()
      });
    }

    // Prepare product data - use farmerId from body or from authenticated user
    const productData = {
      farmerId: req.body.farmerId || req.user._id || req.user.id,
      name: req.body.name,
      quantity: parseFloat(req.body.quantity),
      pricePerKg: parseFloat(req.body.price),
      description: req.body.description || '',
      images: req.body.images || [],
      harvestingDate: req.body.harvestingDate,//? new Date(req.body.harvestingDate) : undefined,
      location: req.body.location || {}
    };

    const product = new Product(productData);
    await product.save();

    // Populate farmer info
    const populatedProduct = await Product.findById(product._id)
      .populate('farmerId', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        product: populatedProduct,
        ...populatedProduct.toObject() // Also include direct fields for compatibility
      }
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during product creation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private (Product owner or admin)
router.put('/:id', protect, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim(),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('quantity')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Quantity must be a non-negative number')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg).join(', ');
      return res.status(400).json({
        success: false,
        message: errorMessages || 'Validation errors',
        errors: errors.array()
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user is the product owner or admin
    const userId = req.user._id || req.user.id;
    if (product.farmerId.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('farmerId', 'name email phone');

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product: updatedProduct }
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during product update'
    });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private (Product owner or admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user is the product owner or admin
    const userId = req.user._id || req.user.id;
    if (product.farmerId.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product'
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during product deletion'
    });
  }
});

// @route   GET /api/products/farmer/:farmerId
// @desc    Get products by farmer
// @access  Public
router.get('/farmer/:farmerId', async (req, res) => {
  try {
    const products = await Product.find({
      farmerId: req.params.farmerId
    }).populate('farmerId', 'name email phone');

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Get farmer products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
