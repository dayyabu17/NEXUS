const express = require('express');
const router = express.Router();

const { getOrganizerDashboard } = require('../controllers/organizerController');
const { protect, organizer } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, organizer, getOrganizerDashboard);

module.exports = router;
