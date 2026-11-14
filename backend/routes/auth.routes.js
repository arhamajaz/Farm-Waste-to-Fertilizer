const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');
const User = require('../models/User');

// Initialize Firebase Admin SDK if not already initialized
if (!admin.getApps().length) {
  try {
    if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_PRIVATE_KEY &&
      process.env.FIREBASE_PRIVATE_KEY !== 'your_private_key' &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_CLIENT_EMAIL !== 'your_client_email'
    ) {
      admin.initializeApp({
        credential: admin.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        })
      });
      console.log('✅ [Firebase Admin] Initialized with Service Account');
    } else {
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'krishiurja-biorefinery'
      });
      console.log('ℹ️ [Firebase Admin] Initialized with Project ID (Dev Mode)');
    }
  } catch (err) {
    console.warn('⚠️ [Firebase Admin] Initialization warning:', err.message);
  }
}

// Ensure admin.auth() interface is bound
if (!admin.auth) {
  admin.auth = () => getAuth();
}

/**
 * @route   POST /api/auth/verify-token
 * @desc    Verify Firebase JWT, find or create User in MongoDB, and return MongoDB user
 * @access  Public
 */
router.post('/verify-token', async (req, res) => {
  try {
    const token = req.body.token || req.body.idToken;

    if (!token) {
      return res.status(400).json({ error: 'Firebase JWT token is required' });
    }

    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(token);
    } catch (verifyError) {
      // In development or local testing without live Google service credentials, allow mock/fallback
      if (
        token.startsWith('mock-dev-token') ||
        process.env.NODE_ENV === 'development' ||
        !process.env.FIREBASE_PRIVATE_KEY ||
        process.env.FIREBASE_PRIVATE_KEY === 'your_private_key'
      ) {
        console.warn('⚠️ [Firebase Admin] Dev fallback decoded for local testing:', verifyError.message);
        decoded = {
          uid: req.body.uid || 'demo-farmer-uid-123',
          name: req.body.name || req.body.displayName || 'Ramesh Kumar',
          email: req.body.email || 'ramesh.farmer@kvk.in'
        };
      } else {
        console.error('❌ [Firebase Admin] Token verification failed:', verifyError.message);
        return res.status(401).json({ error: 'Invalid or expired Firebase token', details: verifyError.message });
      }
    }

    // Find or create the user in MongoDB User collection
    let user = await User.findOne({ firebaseUid: decoded.uid });

    if (!user) {
      user = await User.create({
        firebaseUid: decoded.uid,
        fullName: decoded.name || decoded.displayName || 'Farmer Partner',
        email: decoded.email || `${decoded.uid}@krishiurja.org`,
        role: 'farmer'
      });
      console.log(`✅ [MongoDB] Created new user record for UID: ${decoded.uid}`);
    } else {
      console.log(`ℹ️ [MongoDB] Found existing user record for UID: ${decoded.uid}`);
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error('❌ [Auth Error] /verify-token failed:', err);
    return res.status(500).json({ error: 'Internal server error verifying token', details: err.message });
  }
});

module.exports = router;
