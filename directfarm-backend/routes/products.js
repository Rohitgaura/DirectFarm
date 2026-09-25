const express = require('express');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { protect, authorize } = require('../middleware/auth');
const { Product, User } = require('../models');
const upload = require('../middleware/upload');
const cloudinary = require('../utils/cloudinary');
const streamifier = require('streamifier');

const router = express.Router();

// Helper to upload to Cloudinary from buffer
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'directfarm_products',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// @route   GET /api/products
// @desc    Get all products with filtering and pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const offset = (page - 1) * limit;

    const where = {};

    if (req.query.farmerId) {
      where.farmerId = req.query.farmerId;
    }

    if (req.query.category) {
      where.category = { [Op.iLike]: `%${req.query.category}%` };
    }

    if (req.query.search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${req.query.search}%` } },
        { description: { [Op.iLike]: `%${req.query.search}%` } },
        { category: { [Op.iLike]: `%${req.query.search}%` } }
      ];
    }

    if (req.query.minPrice || req.query.maxPrice) {
      where.pricePerKg = {};
      if (req.query.minPrice) where.pricePerKg[Op.gte] = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) where.pricePerKg[Op.lte] = parseFloat(req.query.maxPrice);
    }

    if (req.query.minQuantity || req.query.maxQuantity) {
      where.quantity = {};
      if (req.query.minQuantity) where.quantity[Op.gte] = parseFloat(req.query.minQuantity);
      if (req.query.maxQuantity) where.quantity[Op.lte] = parseFloat(req.query.maxQuantity);
    }

    // Exclude sold and expired products for general public view unless requested or for farmer's own inventory
    const isFarmerQuery = Boolean(req.query.farmerId);

    if (req.query.includeSold !== 'true' && !isFarmerQuery) {
      where.status = { [Op.ne]: 'sold' };
    }

    if (req.query.includeExpired !== 'true' && !isFarmerQuery) {
      const now = new Date();
      where[Op.and] = where[Op.and] || [];
      where[Op.and].push({
        [Op.or]: [
          { expiryDate: null },
          { autoRemoveEnabled: false },
          { expiryDate: { [Op.gt]: now } }
        ]
      });
    }

    let order = [['createdAt', 'DESC']];
    if (req.query.sortBy) {
      const field = req.query.sortBy === 'price' ? 'pricePerKg' : req.query.sortBy;
      const direction = req.query.sortOrder === 'asc' ? 'ASC' : 'DESC';
      order = [[field, direction]];
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'farmer',
          attributes: ['id', 'name', 'email', 'phone', 'averageRating', 'totalRatings']
        }
      ],
      order,
      limit,
      offset
    });

    // Structure response data to maintain full backward compatibility with frontend
    const formattedProducts = products.map(p => {
      const json = p.toJSON();
      if (p.farmer) {
        json.farmerId = p.farmer.toJSON();
      }
      return json;
    });

    res.json({
      success: true,
      count: formattedProducts.length,
      total: count,
      page,
      pages: Math.ceil(count / limit),
      data: formattedProducts
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
    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'farmer',
          attributes: ['id', 'name', 'email', 'phone', 'address', 'averageRating', 'totalRatings']
        }
      ]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const jsonProduct = product.toJSON();
    if (product.farmer) {
      jsonProduct.farmerId = product.farmer.toJSON();
    }

    res.json({
      success: true,
      data: { product: jsonProduct }
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
router.post('/', protect, authorize('farmer'), upload.array('images', 10), [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('price').custom((value) => {
    const val = parseFloat(value);
    if (isNaN(val) || val < 0) throw new Error('Price must be a positive number');
    return true;
  }),
  body('quantity').custom((value) => {
    const val = parseFloat(value);
    if (isNaN(val) || val < 0) throw new Error('Quantity must be a positive number');
    return true;
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      try {
        const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer));
        const results = await Promise.all(uploadPromises);
        imageUrls = results.map(result => ({
          url: result.secure_url,
          public_id: result.public_id
        }));
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({ success: false, message: 'Image upload failed' });
      }
    }

    let parsedLocation = null;
    if (req.body.location) {
      try {
        parsedLocation = typeof req.body.location === 'string' ? JSON.parse(req.body.location) : req.body.location;
      } catch (e) {
        console.error('Location parsing error:', e.message);
      }
    }

    // Calculate auto-removal expiry date
    const autoRemove = req.body.autoRemoveEnabled === 'false' || req.body.autoRemoveEnabled === false || req.body.expiryUnit === 'never' ? false : true;
    const expiryDuration = parseInt(req.body.expiryDuration || req.body.autoRemoveDuration, 10) || 7;
    const expiryUnit = (req.body.expiryUnit || req.body.autoRemoveUnit || 'days').toLowerCase();

    let expiryDate = null;
    if (autoRemove && expiryUnit !== 'never') {
      const now = new Date();
      expiryDate = new Date(now);
      if (expiryUnit === 'hours') {
        expiryDate.setHours(expiryDate.getHours() + expiryDuration);
      } else {
        expiryDate.setDate(expiryDate.getDate() + expiryDuration);
      }
    }

    const product = await Product.create({
      farmerId: req.user.id,
      name: req.body.name,
      category: req.body.category,
      quantity: parseFloat(req.body.quantity),
      pricePerKg: parseFloat(req.body.price),
      description: req.body.description || '',
      images: imageUrls,
      harvestingDate: req.body.harvestingDate || null,
      location: parsedLocation,
      expiryDuration,
      expiryUnit,
      expiryDate,
      autoRemoveEnabled: autoRemove,
      status: req.body.status || 'active'
    });

    const populatedProduct = await Product.findByPk(product.id, {
      include: [{ model: User, as: 'farmer', attributes: ['id', 'name', 'email', 'phone'] }]
    });

    const jsonProduct = populatedProduct.toJSON();
    if (populatedProduct.farmer) {
      jsonProduct.farmerId = populatedProduct.farmer.toJSON();
    }

    res.status(201).json({
      success: true,
      data: jsonProduct
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private (Product owner or admin)
router.put('/:id', protect, authorize('farmer', 'admin'), upload.array('images', 10), [
  body('name').optional().trim().notEmpty(),
  body('category').optional().trim().notEmpty(),
  body('price').optional().custom((value) => {
    const val = parseFloat(value);
    if (isNaN(val) || val < 0) throw new Error('Price must be a positive number');
    return true;
  }),
  body('quantity').optional().custom((value) => {
    const val = parseFloat(value);
    if (isNaN(val) || val < 0) throw new Error('Quantity must be a positive number');
    return true;
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.farmerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this product' });
    }

    let newImages = [];
    if (req.files && req.files.length > 0) {
      try {
        const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer));
        const results = await Promise.all(uploadPromises);
        newImages = results.map(result => ({
          url: result.secure_url,
          public_id: result.public_id
        }));
      } catch (uploadError) {
        console.error('Cloudinary upload error during update:', uploadError);
        return res.status(500).json({ success: false, message: 'Image upload failed' });
      }
    }

    const updateFields = {};
    if (req.body.name) updateFields.name = req.body.name;
    if (req.body.category) updateFields.category = req.body.category;
    if (req.body.description !== undefined) updateFields.description = req.body.description;
    if (req.body.quantity !== undefined) updateFields.quantity = parseFloat(req.body.quantity);
    if (req.body.price !== undefined) updateFields.pricePerKg = parseFloat(req.body.price);
    if (req.body.harvestingDate) updateFields.harvestingDate = req.body.harvestingDate;

    if (req.body.location) {
      try {
        updateFields.location = typeof req.body.location === 'string' ? JSON.parse(req.body.location) : req.body.location;
      } catch (e) {
        console.error('Error parsing location JSON', e);
      }
    }

    if (req.body.status) {
      updateFields.status = req.body.status;
    }

    if (req.body.expiryDuration || req.body.expiryUnit || req.body.autoRemoveEnabled !== undefined) {
      const autoRemove = req.body.autoRemoveEnabled === 'false' || req.body.autoRemoveEnabled === false || req.body.expiryUnit === 'never' ? false : true;
      const expiryDuration = parseInt(req.body.expiryDuration || product.expiryDuration || 7, 10);
      const expiryUnit = (req.body.expiryUnit || product.expiryUnit || 'days').toLowerCase();

      updateFields.autoRemoveEnabled = autoRemove;
      updateFields.expiryDuration = expiryDuration;
      updateFields.expiryUnit = expiryUnit;

      if (autoRemove && expiryUnit !== 'never') {
        const now = new Date();
        const expiryDate = new Date(now);
        if (expiryUnit === 'hours') {
          expiryDate.setHours(expiryDate.getHours() + expiryDuration);
        } else {
          expiryDate.setDate(expiryDate.getDate() + expiryDuration);
        }
        updateFields.expiryDate = expiryDate;
      } else {
        updateFields.expiryDate = null;
      }
    }

    if (newImages.length > 0) {
      updateFields.images = [...(product.images || []), ...newImages];
    }

    await product.update(updateFields);

    const updatedProduct = await Product.findByPk(req.params.id, {
      include: [{ model: User, as: 'farmer', attributes: ['id', 'name', 'email', 'phone'] }]
    });

    const jsonProduct = updatedProduct.toJSON();
    if (updatedProduct.farmer) {
      jsonProduct.farmerId = updatedProduct.farmer.toJSON();
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: jsonProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private (Product owner or admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.farmerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product'
      });
    }

    await product.destroy();

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
    const products = await Product.findAll({
      where: { farmerId: req.params.farmerId },
      include: [{ model: User, as: 'farmer', attributes: ['id', 'name', 'email', 'phone'] }],
      order: [['createdAt', 'DESC']]
    });

    const formattedProducts = products.map(p => {
      const json = p.toJSON();
      if (p.farmer) {
        json.farmerId = p.farmer.toJSON();
      }
      return json;
    });

    res.json({
      success: true,
      count: formattedProducts.length,
      data: formattedProducts
    });
  } catch (error) {
    console.error('Get farmer products error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PATCH /api/products/:id/status
// @desc    Toggle or update product status (active vs sold)
// @access  Private (Product owner or admin)
router.patch('/:id/status', protect, authorize('farmer', 'admin'), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.farmerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this product status' });
    }

    const newStatus = req.body.status || (product.status === 'sold' ? 'active' : 'sold');
    await product.update({ status: newStatus });

    res.json({
      success: true,
      message: `Product status updated to ${newStatus}`,
      data: product.toJSON()
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ success: false, message: 'Server error updating product status' });
  }
});

module.exports = router;
