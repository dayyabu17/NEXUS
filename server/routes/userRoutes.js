const express = require('express');
const { updateThemePreference, getPublicUserProfile, updateUserInterests } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/public/:id', getPublicUserProfile);

router.put('/theme', protect, updateThemePreference);

/**
 * @route PUT /api/users/interests
 * @desc Update the authenticated user's interests
 * @access Private
 */
router.put('/interests', protect, updateUserInterests);

module.exports = router;
