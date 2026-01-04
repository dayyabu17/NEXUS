const express = require('express');
const { updateThemePreference } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.put('/theme', protect, updateThemePreference);

module.exports = router;
