const express = require('express');
const router = express.Router();

const {
	getOrganizerDashboard,
	getOrganizerEvents,
	getOrganizerEventDetails,
	createOrganizerEvent,
} = require('../controllers/organizerController');
const { protect, organizer } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, organizer, getOrganizerDashboard);

router
	.route('/events')
	.get(protect, organizer, getOrganizerEvents)
	.post(protect, organizer, createOrganizerEvent);

router.get('/events/:id', protect, organizer, getOrganizerEventDetails);

module.exports = router;
