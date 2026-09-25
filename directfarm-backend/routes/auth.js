const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { User, LoginLog, Farmer, Buyer, PendingRegistration } = require('../models');
const { protect, generateToken } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/auth/register/initiate
// @desc    Initiate registration - validate data and send email OTP
// @access  Public
router.post('/register/initiate', [
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
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, email, password, phone, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Remove any existing pending registration for same email
    await PendingRegistration.destroy({ where: { email } });

    // Generate 6-digit OTP
    const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP and password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(emailOtp, salt);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create pending registration
    const pendingReg = await PendingRegistration.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
      experienceYears: role === 'farmer' ? (req.body.experienceYears || 0) : 0,
      address: req.body.address || '',
      farmName: req.body.farmName || `${name}'s Farm`,
      emailOtp: hashedOtp,
      lastOtpSentAt: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

    // Send OTP email
    const message = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8faf5; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🌱 DirectFarm</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 16px;">Email Verification</p>
        </div>
        <div style="padding: 40px 30px;">
          <p style="color: #333; font-size: 16px; margin: 0 0 8px;">Hello <strong>${name}</strong>,</p>
          <p style="color: #555; font-size: 15px; line-height: 1.6;">Thank you for registering with DirectFarm! Please use the OTP below to verify your email address.</p>
          <div style="background: white; border: 2px dashed #4CAF50; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
            <p style="color: #999; font-size: 13px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
            <h1 style="color: #2E7D32; letter-spacing: 8px; font-size: 36px; margin: 0; font-weight: 800;">${emailOtp}</h1>
          </div>
          <p style="color: #888; font-size: 13px; text-align: center;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
        </div>
        <div style="background: #e8f5e9; padding: 20px 30px; text-align: center;">
          <p style="color: #666; font-size: 12px; margin: 0;">If you didn't register on DirectFarm, you can safely ignore this email.</p>
        </div>
      </div>
    `;

    try {
      const sendEmail = require('../utils/sendEmail');
      await sendEmail({
        email: email,
        subject: 'DirectFarm - Verify Your Email Address',
        message
      });
      console.log(`📧 Email OTP sent to ${email}: ${emailOtp}`);
    } catch (err) {
      console.error('Email sending failed (Dev Mode):', err.message);
      console.log(`📧 Email OTP for ${email}: ${emailOtp} (email delivery failed, use this OTP)`);
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email address',
      data: {
        registrationId: pendingReg.id,
        email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
        expiresIn: '10 minutes'
      }
    });
  } catch (error) {
    console.error('Registration initiation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/register/verify-otp
// @desc    Verify email OTP for registration
// @access  Public
router.post('/register/verify-otp', [
  body('registrationId')
    .notEmpty()
    .withMessage('Registration ID is required'),
  body('emailOtp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits')
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

    const { registrationId, emailOtp } = req.body;

    const pendingReg = await PendingRegistration.findByPk(registrationId);
    if (!pendingReg) {
      return res.status(400).json({
        success: false,
        message: 'Registration expired or not found. Please register again.'
      });
    }

    if (pendingReg.emailVerified) {
      return res.status(200).json({
        success: true,
        message: 'Email already verified',
        data: { emailVerified: true }
      });
    }

    const isMatch = await bcrypt.compare(emailOtp, pendingReg.emailOtp);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please try again.'
      });
    }

    pendingReg.emailVerified = true;
    await pendingReg.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully!',
      data: { emailVerified: true }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during OTP verification'
    });
  }
});

// @route   POST /api/auth/register/confirm
// @desc    Confirm registration after OTP verification
// @access  Public
router.post('/register/confirm', [
  body('registrationId')
    .notEmpty()
    .withMessage('Registration ID is required')
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

    const { registrationId } = req.body;

    const pendingReg = await PendingRegistration.findByPk(registrationId);
    if (!pendingReg) {
      return res.status(400).json({
        success: false,
        message: 'Registration expired or not found. Please register again.'
      });
    }

    if (!pendingReg.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Please verify your email before confirming registration.'
      });
    }

    const existingUser = await User.findOne({ where: { email: pendingReg.email } });
    if (existingUser) {
      await PendingRegistration.destroy({ where: { id: registrationId } });
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user with already hashed password
    const user = await User.create({
      name: pendingReg.name,
      email: pendingReg.email,
      password: pendingReg.password,
      phone: pendingReg.phone,
      role: pendingReg.role,
      experienceYears: pendingReg.role === 'farmer' ? pendingReg.experienceYears : 0,
      address: pendingReg.address
    });

    if (pendingReg.role === 'farmer') {
      await Farmer.create({
        userId: user.id,
        name: pendingReg.name,
        email: pendingReg.email,
        phone: pendingReg.phone,
        address: pendingReg.address,
        farmName: pendingReg.farmName,
        experienceYears: pendingReg.experienceYears,
        verificationStatus: false
      });
    } else if (pendingReg.role === 'buyer') {
      await Buyer.create({
        userId: user.id,
        name: pendingReg.name,
        email: pendingReg.email,
        phone: pendingReg.phone,
        address: pendingReg.address,
        verificationStatus: false
      });
    }

    // Delete pending registration
    await PendingRegistration.destroy({ where: { id: registrationId } });

    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Registration completed successfully! Welcome to DirectFarm!',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('Registration confirmation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration confirmation'
    });
  }
});

// @route   POST /api/auth/register/resend-otp
// @desc    Resend email OTP for registration
// @access  Public
router.post('/register/resend-otp', [
  body('registrationId')
    .notEmpty()
    .withMessage('Registration ID is required')
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

    const { registrationId } = req.body;

    const pendingReg = await PendingRegistration.findByPk(registrationId);
    if (!pendingReg) {
      return res.status(400).json({
        success: false,
        message: 'Registration expired or not found. Please register again.'
      });
    }

    const timeSinceLastSend = Date.now() - new Date(pendingReg.lastOtpSentAt).getTime();
    if (timeSinceLastSend < 60000) {
      const waitSeconds = Math.ceil((60000 - timeSinceLastSend) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${waitSeconds} seconds before requesting another OTP`,
        data: { retryAfter: waitSeconds }
      });
    }

    if (pendingReg.otpResendCount >= 5) {
      return res.status(429).json({
        success: false,
        message: 'Maximum OTP resend limit reached. Please register again.'
      });
    }

    const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(emailOtp, salt);

    pendingReg.emailOtp = hashedOtp;
    pendingReg.emailVerified = false;
    pendingReg.otpResendCount += 1;
    pendingReg.lastOtpSentAt = new Date();
    pendingReg.expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await pendingReg.save();

    const message = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8faf5; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🌱 DirectFarm</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 16px;">Email Verification (Resent)</p>
        </div>
        <div style="padding: 40px 30px;">
          <p style="color: #333; font-size: 16px; margin: 0 0 8px;">Hello <strong>${pendingReg.name}</strong>,</p>
          <p style="color: #555; font-size: 15px;">Here is your new verification code:</p>
          <div style="background: white; border: 2px dashed #4CAF50; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
            <p style="color: #999; font-size: 13px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
            <h1 style="color: #2E7D32; letter-spacing: 8px; font-size: 36px; margin: 0; font-weight: 800;">${emailOtp}</h1>
          </div>
          <p style="color: #888; font-size: 13px; text-align: center;">This code expires in <strong>10 minutes</strong>.</p>
        </div>
      </div>
    `;

    try {
      const sendEmail = require('../utils/sendEmail');
      await sendEmail({
        email: pendingReg.email,
        subject: 'DirectFarm - Your New Verification Code',
        message
      });
      console.log(`📧 Resent OTP to ${pendingReg.email}: ${emailOtp}`);
    } catch (err) {
      console.error('Email resend failed (Dev Mode):', err.message);
      console.log(`📧 Resent OTP for ${pendingReg.email}: ${emailOtp} (email failed, use this OTP)`);
    }

    res.status(200).json({
      success: true,
      message: 'New OTP sent to your email',
      data: {
        remainingResends: 5 - pendingReg.otpResendCount
      }
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(user.id);

    // Log login event safely
    try {
      const lat = req.body.latitude ? parseFloat(req.body.latitude) : null;
      const lng = req.body.longitude ? parseFloat(req.body.longitude) : null;
      await LoginLog.create({
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        authMethod: 'local',
        latitude: isNaN(lat) ? null : lat,
        longitude: isNaN(lng) ? null : lng
      });
    } catch (logError) {
      console.error('Failed to log login event:', logError.message);
    }

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
    const user = await User.findByPk(req.user.id);

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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, phone, address, latitude, longitude } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address !== undefined) user.address = address;

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
// @desc    Logout user
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

    let user = await User.findOne({
      where: {
        [Op.or]: [{ googleId }, { email }]
      }
    });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
        user.profilePicture = picture;
        await user.save();
      }

      const token = generateToken(user.id);

      try {
        await LoginLog.create({
          userId: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          authMethod: 'google',
          latitude: req.body.latitude || null,
          longitude: req.body.longitude || null
        });
      } catch (logError) {
        console.error('Failed to log Google login event:', logError);
      }

      return res.json({
        success: true,
        message: 'Login successful',
        data: { user, token }
      });
    }

    if (!phone || !role) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and role are required for new users',
        needsAdditionalInfo: true
      });
    }

    user = await User.create({
      name,
      email,
      googleId,
      authProvider: 'google',
      phone,
      role,
      profilePicture: picture
    });

    if (role === 'farmer') {
      await Farmer.create({
        userId: user.id,
        name,
        email,
        phone,
        farmName: `${name}'s Farm`,
        verificationStatus: false
      });
    } else if (role === 'buyer') {
      await Buyer.create({
        userId: user.id,
        name,
        email,
        phone,
        verificationStatus: false
      });
    }

    const token = generateToken(user.id);

    try {
      await LoginLog.create({
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        authMethod: 'google',
        latitude: req.body.latitude || null,
        longitude: req.body.longitude || null
      });
    } catch (logError) {
      console.error('Failed to log Google registration login event:', logError);
    }

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

    let user = await User.findOne({
      where: {
        [Op.or]: [{ facebookId }, { email }]
      }
    });

    if (user) {
      if (!user.facebookId) {
        user.facebookId = facebookId;
        user.authProvider = 'facebook';
        user.profilePicture = profilePicture;
        await user.save();
      }

      const token = generateToken(user.id);

      try {
        await LoginLog.create({
          userId: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          authMethod: 'facebook',
          latitude: req.body.latitude || null,
          longitude: req.body.longitude || null
        });
      } catch (logError) {
        console.error('Failed to log Facebook login event:', logError);
      }

      return res.json({
        success: true,
        message: 'Login successful',
        data: { user, token }
      });
    }

    if (!phone || !role) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and role are required for new users',
        needsAdditionalInfo: true
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required. Please grant email permission to Facebook app.'
      });
    }

    user = await User.create({
      name,
      email,
      facebookId,
      authProvider: 'facebook',
      phone,
      role,
      profilePicture
    });

    if (role === 'farmer') {
      await Farmer.create({
        userId: user.id,
        name,
        email,
        phone,
        farmName: `${name}'s Farm`,
        verificationStatus: false
      });
    } else if (role === 'buyer') {
      await Buyer.create({
        userId: user.id,
        name,
        email,
        phone,
        verificationStatus: false
      });
    }

    const token = generateToken(user.id);

    try {
      await LoginLog.create({
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        authMethod: 'facebook',
        latitude: req.body.latitude || null,
        longitude: req.body.longitude || null
      });
    } catch (logError) {
      console.error('Failed to log Facebook registration login event:', logError);
    }

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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'There is no user with that email'
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(10);
    user.resetPasswordOtp = await bcrypt.hash(otp, salt);
    user.resetPasswordOtpExpire = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

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

      console.log(`OTP sent to ${user.email}: ${otp}`);

      res.status(200).json({
        success: true,
        message: 'Email sent'
      });
    } catch (err) {
      console.error('Email sending failed (Dev Mode - Continuing):', err.message);
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, otp, password } = req.body;

    const user = await User.findOne({
      where: {
        email,
        resetPasswordOtpExpire: { [Op.gt]: new Date() }
      }
    });

    if (!user || !user.resetPasswordOtp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or OTP has expired'
      });
    }

    const isMatch = await bcrypt.compare(otp, user.resetPasswordOtp);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    user.password = password;
    user.resetPasswordOtp = null;
    user.resetPasswordOtpExpire = null;

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
