const express = require('express');
const router = express.Router();

const { getOrganizerDashboard, getOrganizerEvents } = require('../controllers/organizerController');
const { protect, organizer } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, organizer, getOrganizerDashboard);
router.get('/events', protect, organizer, getOrganizerEvents);

module.exports = router;
