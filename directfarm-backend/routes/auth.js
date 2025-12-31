const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Farmer = require('../models/Farmer');
const Buyer = require('../models/Buyer');
const { protect, generateToken } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('phone')
    .matches(/^[0-9]{10}$/)
    .withMessage('Please provide a valid 10-digit phone number'),
  body('role')
    .isIn(['farmer', 'buyer'])
    .withMessage('Role must be either farmer or buyer'),
  body('experienceYears')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Experience years must be between 0 and 50')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    console.log("error is here", errors);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, email, password, phone, role } = req.body;
    console.log(req.body);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user object
    const userData = {
      name,
      email,
      password,
      phone,
      role
      //address: address || ''
    };

    // Only add experienceYears if role is farmer
    if (role === 'farmer' && req.body.experienceYears !== undefined) {
      userData.experienceYears = req.body.experienceYears;
    }

    const user = new User(userData);

    await user.save();

    // Create Farmer or Buyer record based on role
    if (role === 'farmer') {
      const farmer = new Farmer({
        userId: user._id,
        name: name,
        email: email,
        phone: phone,
        address: req.body.address || '',
        farmName: req.body.farmName || `${name}'s Farm`,
        experienceYears: req.body.experienceYears,
        verificationStatus: false
      });
      await farmer.save();
    } else if (role === 'buyer') {
      const buyer = new Buyer({
        userId: user._id,
        name: name,
        email: email,
        phone: phone,
        address: req.body.address || '',
        verificationStatus: false
      });
      await buyer.save();
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], async (req, res) => {
  try {

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;


    // Find user by email and include password for comparison
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token
      }
    });
  } catch (error) {

    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage('Please provide a valid 10-digit phone number')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, phone, address, latitude, longitude } = req.body;

    // Find and update user
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address !== undefined) user.address = address;

    // Update location if coordinates are provided
    if (latitude !== undefined && longitude !== undefined) {
      user.location = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
        formattedAddress: user.location?.formattedAddress || ''
      };
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during profile update'
    });
  }
});

// @route   GET /api/auth/verify-token
// @desc    Verify token validity
// @access  Private
router.get('/verify-token', protect, async (req, res) => {
  try {
    res.json({
      success: true,
      valid: true,
      message: 'Token is valid',
      data: {
        user: req.user
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      valid: false,
      message: 'Token is invalid'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', protect, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @route   POST /api/auth/google
// @desc    Google OAuth login
// @access  Public
router.post('/google', async (req, res) => {
  try {
    const { credential, phone, role } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Google credential is required'
      });
    }

    // Verify Google token
    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      payload = ticket.getPayload();
    } catch (error) {
      console.error('Google token verification error:', error);
      return res.status(401).json({
        success: false,
        message: 'Invalid Google token'
      });
    }

    const { sub: googleId, email, name, picture } = payload;

    // Check if user exists by googleId or email
    let user = await User.findOne({
      $or: [{ googleId }, { email }]
    });

    if (user) {
      // Existing user - update googleId if not set
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
        user.profilePicture = picture;
        await user.save();
      }

      // Generate token
      const token = generateToken(user._id);

      return res.json({
        success: true,
        message: 'Login successful',
        data: { user, token }
      });
    }

    // New user - check if phone and role are provided
    if (!phone || !role) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and role are required for new users',
        needsAdditionalInfo: true
      });
    }

    // Create new user
    user = new User({
      name,
      email,
      googleId,
      authProvider: 'google',
      phone,
      role,
      profilePicture: picture
    });

    await user.save();

    // Create Farmer or Buyer record based on role
    if (role === 'farmer') {
      const farmer = new Farmer({
        userId: user._id,
        name,
        email,
        phone,
        farmName: `${name}'s Farm`,
        verificationStatus: false
      });
      await farmer.save();
    } else if (role === 'buyer') {
      const buyer = new Buyer({
        userId: user._id,
        name,
        email,
        phone,
        verificationStatus: false
      });
      await buyer.save();
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { user, token }
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during Google authentication'
    });
  }
});

// @route   POST /api/auth/facebook
// @desc    Facebook OAuth login
// @access  Public
router.post('/facebook', async (req, res) => {
  try {
    const { accessToken, userID, phone, role } = req.body;

    if (!accessToken || !userID) {
      return res.status(400).json({
        success: false,
        message: 'Facebook access token and user ID are required'
      });
    }

    // Verify Facebook token by fetching user data
    const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
    let fbResponse;

    try {
      fbResponse = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`
      );

      if (!fbResponse.ok) {
        throw new Error('Invalid Facebook token');
      }
    } catch (error) {
      console.error('Facebook token verification error:', error);
      return res.status(401).json({
        success: false,
        message: 'Invalid Facebook token'
      });
    }

    const fbData = await fbResponse.json();

    if (fbData.id !== userID) {
      return res.status(401).json({
        success: false,
        message: 'Facebook user ID mismatch'
      });
    }

    const { id: facebookId, email, name, picture } = fbData;
    const profilePicture = picture?.data?.url;

    // Check if user exists by facebookId or email
    let user = await User.findOne({
      $or: [{ facebookId }, { email }]
    });

    if (user) {
      // Existing user - update facebookId if not set
      if (!user.facebookId) {
        user.facebookId = facebookId;
        user.authProvider = 'facebook';
        user.profilePicture = profilePicture;
        await user.save();
      }

      // Generate token
      const token = generateToken(user._id);

      return res.json({
        success: true,
        message: 'Login successful',
        data: { user, token }
      });
    }

    // New user - check if phone and role are provided
    if (!phone || !role) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and role are required for new users',
        needsAdditionalInfo: true
      });
    }

    // Facebook might not provide email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required. Please grant email permission to Facebook app.'
      });
    }

    // Create new user
    user = new User({
      name,
      email,
      facebookId,
      authProvider: 'facebook',
      phone,
      role,
      profilePicture
    });

    await user.save();

    // Create Farmer or Buyer record based on role
    if (role === 'farmer') {
      const farmer = new Farmer({
        userId: user._id,
        name,
        email,
        phone,
        farmName: `${name}'s Farm`,
        verificationStatus: false
      });
      await farmer.save();
    } else if (role === 'buyer') {
      const buyer = new Buyer({
        userId: user._id,
        name,
        email,
        phone,
        verificationStatus: false
      });
      await buyer.save();
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { user, token }
    });
  } catch (error) {
    console.error('Facebook OAuth error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during Facebook authentication'
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Forgot password - send OTP
// @access  Public
router.post('/forgot-password', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'There is no user with that email'
      });
    }

    // Generate Random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP before saving
    const salt = await bcrypt.genSalt(10);
    user.resetPasswordOtp = await bcrypt.hash(otp, salt);

    // Set expiration (10 minutes)
    user.resetPasswordOtpExpire = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    // Create reset message
    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>You are receiving this email because you (or someone else) has requested the reset of a password.</p>
        <p>Your Password Reset OTP is:</p>
        <h1 style="color: #2c3e50; letter-spacing: 5px;">${otp}</h1>
        <p>This OTP is valid for 10 minutes.</p>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      </div>
    `;

    try {
      const sendEmail = require('../utils/sendEmail');
      await sendEmail({
        email: user.email,
        subject: 'DirectFarm Password Reset OTP',
        message
      });

      console.log(`OTP sent to ${user.email}: ${otp}`); // For debugging

      res.status(200).json({
        success: true,
        message: 'Email sent'
      });
    } catch (err) {
      console.error('Email sending failed (Dev Mode - Continuing):', err.message);

      // In development, we don't want to block the flow if email fails.
      // We keep the OTP saved in the DB so you can use the one logged in console.
      return res.status(200).json({
        success: true,
        message: 'OTP generated (Check backend console)',
        devNote: 'Email failed to send. Use the OTP logged in the terminal.'
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password
// @access  Public
router.post('/reset-password', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('Invalid OTP'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, otp, password } = req.body;

    // Get user with valid expiration
    const user = await User.findOne({
      email,
      resetPasswordOtpExpire: { $gt: Date.now() }
    }).select('+password +resetPasswordOtp'); // Explicitly select resetPasswordOtp

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or OTP has expired'
      });
    }

    // Verify OTP
    const isMatch = await bcrypt.compare(otp, user.resetPasswordOtp);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
