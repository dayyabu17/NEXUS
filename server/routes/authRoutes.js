const express = require('express');
const router = express.Router();

const { 
    loginUser, 
    updateUserProfile, 
    updateProfilePicture 
} = require('../controllers/authController'); 

const { protect } = require('../middleware/authMiddleware'); 

/**
 * @module routes/authRoutes
 * @description API routes for authentication and user profile management.
 */

/**
 * @route POST /api/auth/login
 * @description Authenticate user and get token.
 * @access Public
 */
router.post('/login', loginUser);

/**
 * @route PUT /api/auth/profile
 * @description Update user profile (name, email, password).
 * @access Private
 */
router.put('/profile', protect, updateUserProfile);

/**
 * @route PUT /api/auth/profile/picture
 * @description Upload and update user profile picture.
 * @access Private
 */
router.put('/profile/picture', protect, updateProfilePicture);

module.exports = router;
