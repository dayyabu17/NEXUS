const express = require('express');
const router = express.Router();

const {
	getOrganizerDashboard,
	getOrganizerEvents,
	getOrganizerEventDetails,
	getEventGuests,
	updateEventGuestCheckIn,
	createOrganizerEvent,
	getOrganizerNotifications,
	markOrganizerNotificationRead,
	markAllOrganizerNotificationsRead,
	getOrganizerPreferences,
	updateOrganizerPreferences,
	getOrganizerEarnings,
} = require('../controllers/organizerController');
const { getOrganizerEventFeedback } = require('../controllers/feedbackController');
const { protect, organizer } = require('../middleware/authMiddleware');

/**
 * @route GET /api/organizer/dashboard
 * @desc Get organizer dashboard stats and data.
 * @access Private (Organizer)
 */
router.get('/dashboard', protect, organizer, getOrganizerDashboard);

/**
 * @route GET /api/organizer/notifications
 * @desc Get organizer notifications.
 * @access Private (Organizer)
 */
router.get('/notifications', protect, organizer, getOrganizerNotifications);

/**
 * @route POST /api/organizer/notifications/read
 * @desc Mark a notification as read.
 * @access Private (Organizer)
 */
router.post('/notifications/read', protect, organizer, markOrganizerNotificationRead);

/**
 * @route POST /api/organizer/notifications/read-all
 * @desc Mark all notifications as read.
 * @access Private (Organizer)
 */
router.post('/notifications/read-all', protect, organizer, markAllOrganizerNotificationsRead);

/**
 * @route GET /api/organizer/earnings
 * @desc Get organizer earnings and payout info.
 * @access Private (Organizer)
 */
router.get('/earnings', protect, organizer, getOrganizerEarnings);

/**
 * @route GET /api/organizer/preferences
 * @desc Get organizer preferences.
 * @access Private (Organizer)
 */
/**
 * @route PUT /api/organizer/preferences
 * @desc Update organizer preferences.
 * @access Private (Organizer)
 */
router
	.route('/preferences')
	.get(protect, organizer, getOrganizerPreferences)
	.put(protect, organizer, updateOrganizerPreferences);

/**
 * @route GET /api/organizer/events
 * @desc Get all events created by the organizer.
 * @access Private (Organizer)
 */
/**
 * @route POST /api/organizer/events
 * @desc Create a new event.
 * @access Private (Organizer)
 */
router
	.route('/events')
	.get(protect, organizer, getOrganizerEvents)
	.post(protect, organizer, createOrganizerEvent);

/**
 * @route GET /api/organizer/events/:id/guests
 * @desc Get guest list for an event.
 * @access Private (Organizer)
 */
router.get('/events/:id/guests', protect, organizer, getEventGuests);

/**
 * @route GET /api/organizer/events/:id/feedback
 * @desc Get feedback for an event.
 * @access Private (Organizer)
 */
router.get('/events/:id/feedback', protect, organizer, getOrganizerEventFeedback);

/**
 * @route PATCH /api/organizer/events/:eventId/guests/:ticketId/check-in
 * @desc Check-in a guest.
 * @access Private (Organizer)
 */
router.patch('/events/:eventId/guests/:ticketId/check-in', protect, organizer, updateEventGuestCheckIn);

/**
 * @route GET /api/organizer/events/:id
 * @desc Get detailed info for a specific event.
 * @access Private (Organizer)
 */
router.get('/events/:id', protect, organizer, getOrganizerEventDetails);

module.exports = router;
