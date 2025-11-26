const express = require('express');
const router = express.Router();

const {
	getOrganizerDashboard,
	getOrganizerEvents,
	getOrganizerEventDetails,
	createOrganizerEvent,
	getOrganizerNotifications,
	markOrganizerNotificationRead,
	markAllOrganizerNotificationsRead,
} = require('../controllers/organizerController');
const { protect, organizer } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, organizer, getOrganizerDashboard);
router.get('/notifications', protect, organizer, getOrganizerNotifications);
router.post('/notifications/read', protect, organizer, markOrganizerNotificationRead);
router.post('/notifications/read-all', protect, organizer, markAllOrganizerNotificationsRead);

router
	.route('/events')
	.get(protect, organizer, getOrganizerEvents)
	.post(protect, organizer, createOrganizerEvent);

router.get('/events/:id', protect, organizer, getOrganizerEventDetails);

module.exports = router;
