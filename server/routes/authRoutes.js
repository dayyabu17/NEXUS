const express = require('express');
const router = express.Router();

// --- CRITICAL: Import all controller functions here and ONLY here ---
const { 
    loginUser, 
    updateUserProfile, 
    updateProfilePicture 
} = require('../controllers/authController'); 

const { protect } = require('../middleware/authMiddleware'); 

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', loginUser);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile information
 * @access  Private
 */
router.put('/profile', protect, updateUserProfile);

/**
 * @route   PUT /api/auth/profile/picture
 * @desc    Upload user profile picture
 * @access  Private
 */
router.put('/profile/picture', protect, updateProfilePicture);

module.exports = router;
