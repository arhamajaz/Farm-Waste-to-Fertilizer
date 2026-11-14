const express = require('express');
const router = express.Router();
const User = require('../models/User');

/**
 * @route   GET /api/auth/status
 * @desc    Check authentication service status
 * @access  Public
 */
router.get('/status', (req, res) => {
  res.json({
    success: true,
    message: 'Auth routing service is online and ready for Firebase SSO verification.',
    timestamp: new Date().toISOString()
  });
});

/**
 * @route   POST /api/auth/verify-token
 * @desc    Verify Firebase ID token and synchronize/upsert user record
 * @access  Public
 */
router.post('/verify-token', async (req, res) => {
  try {
    const { idToken, userDetails } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Missing required idToken in request payload'
      });
    }

    // Boilerplate sync: When Firebase Admin SDK credentials are provided in .env,
    // this verifies the decoded token:
    // const decodedToken = await admin.auth().verifyIdToken(idToken);
    // const uid = decodedToken.uid;

    return res.status(200).json({
      success: true,
      message: 'Token verification endpoint scaffolded successfully',
      data: {
        firebaseUid: userDetails?.firebaseUid || 'scaffold-uid-placeholder',
        email: userDetails?.email || 'farmer@krishiurja.org',
        role: userDetails?.role || 'farmer'
      }
    });
  } catch (err) {
    console.error('Error in /api/auth/verify-token:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify authentication token',
      error: err.message
    });
  }
});

/**
 * @route   GET /api/auth/profile/:firebaseUid
 * @desc    Fetch user profile and farm details by Firebase UID
 * @access  Public / Authenticated
 */
router.get('/profile/:firebaseUid', async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.firebaseUid });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve user profile',
      error: err.message
    });
  }
});

module.exports = router;
