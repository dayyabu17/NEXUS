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

// @route   /api/auth
router.post('/login', loginUser);
router.post('/register', registerUser);

// Protected routes for profile management
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);
router.put('/profile/picture', protect, updateProfilePicture);

module.exports = router;