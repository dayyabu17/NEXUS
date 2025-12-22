const express = require('express');
const router = express.Router();

// --- CRITICAL: Import all controller functions here and ONLY here ---
const { 
    loginUser, 
    registerUser,
    getUserProfile,
    updateUserProfile, 
    updateProfilePicture 
} = require('../controllers/authController'); 

const { protect } = require('../middleware/authMiddleware'); 

/**
 * @route POST /api/auth/login
 * @desc Authenticate user and get token.
 * @access Public
 */
router.post('/login', loginUser);

/**
 * @route POST /api/auth/register
 * @desc Register a new user.
 * @access Public
 */
router.post('/register', registerUser);

/**
 * @route GET /api/auth/profile
 * @desc Get user profile.
 * @access Private
 */
/**
 * @route PUT /api/auth/profile
 * @desc Update user profile.
 * @access Private
 */
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

/**
 * @route PUT /api/auth/profile/picture
 * @desc Upload/Update user profile picture.
 * @access Private
 */
router.put('/profile/picture', protect, updateProfilePicture);

module.exports = router;