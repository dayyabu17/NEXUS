const express = require('express');
const router = express.Router();

const {
	getOrganizerDashboard,
	getOrganizerEvents,
	getOrganizerEventDetails,
	getEventGuests,
	createOrganizerEvent,
	getOrganizerNotifications,
	markOrganizerNotificationRead,
	markAllOrganizerNotificationsRead,
	getOrganizerPreferences,
	updateOrganizerPreferences,
	getOrganizerEarnings,
} = require('../controllers/organizerController');
const { protect, organizer } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, organizer, getOrganizerDashboard);
router.get('/notifications', protect, organizer, getOrganizerNotifications);
router.post('/notifications/read', protect, organizer, markOrganizerNotificationRead);
router.post('/notifications/read-all', protect, organizer, markAllOrganizerNotificationsRead);
router.get('/earnings', protect, organizer, getOrganizerEarnings);

router
	.route('/preferences')
	.get(protect, organizer, getOrganizerPreferences)
	.put(protect, organizer, updateOrganizerPreferences);

router
	.route('/events')
	.get(protect, organizer, getOrganizerEvents)
	.post(protect, organizer, createOrganizerEvent);

router.get('/events/:id/guests', protect, organizer, getEventGuests);
router.get('/events/:id', protect, organizer, getOrganizerEventDetails);

module.exports = router;
