const express = require('express');
const router = express.Router();

// --- CRITICAL: Import all controller functions here and ONLY here ---
const { 
    loginUser, 
    updateUserProfile, 
    updateProfilePicture 
} = require('../controllers/authController'); 

const { protect } = require('../middleware/authMiddleware'); 

// @route   /api/auth
router.post('/login', loginUser);

// Protected routes for profile management
router.put('/profile', protect, updateUserProfile);
router.put('/profile/picture', protect, updateProfilePicture);

module.exports = router;