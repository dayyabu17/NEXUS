const express = require('express');
const { updateThemePreference, getPublicUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/public/:id', getPublicUserProfile);

router.put('/theme', protect, updateThemePreference);

module.exports = router;
