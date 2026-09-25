const express = require('express');
const router = express.Router();
const { Complaint } = require('../models');
const nodemailer = require('nodemailer');

const generateRequestId = () => {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CMP-${year}-${random}`;
};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// @route   POST /api/complaints
// @desc    Submit a new complaint
// @access  Public
router.post('/', async (req, res) => {
  const { name, email, description } = req.body;

  if (!name || !email || !description) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  try {
    const requestId = generateRequestId();

    const complaint = await Complaint.create({
      requestId,
      name,
      email,
      description
    });

    const mailOptions = {
      from: process.env.EMAIL_USER || 'no-reply@directfarm.com',
      to: email,
      subject: 'Complaint Received - DirectFarm',
      text: `Dear ${name},\n\nWe have received your complaint regarding: "${description}".\n\nYour Request ID is: ${requestId}\n\nYou can use this ID to track the status of your complaint on our website.\n\nBest Regards,\nDirectFarm Team`
    };

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error('Error sending email:', err.message);
        } else {
          console.log('Email sent:', info.response);
        }
      });
    }

    res.json({
      msg: 'Complaint submitted successfully',
      requestId: complaint.requestId,
      complaint
    });
  } catch (err) {
    console.error('Complaint submission error:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/complaints/:requestId
// @desc    Track a complaint by ID
// @access  Public
router.get('/:requestId', async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ where: { requestId: req.params.requestId } });

    if (!complaint) {
      return res.status(404).json({ msg: 'Complaint not found' });
    }

    res.json(complaint);
  } catch (err) {
    console.error('Complaint tracking error:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
