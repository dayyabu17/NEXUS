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

/**
 * @module routes/organizerRoutes
 * @description API routes for organizer-specific operations.
 */

/**
 * @route GET /api/organizer/dashboard
 * @description Get dashboard statistics for the organizer.
 * @access Private (Organizer)
 */
router.get('/dashboard', protect, organizer, getOrganizerDashboard);

/**
 * @route GET /api/organizer/notifications
 * @description Get notifications for the organizer.
 * @access Private (Organizer)
 */
router.get('/notifications', protect, organizer, getOrganizerNotifications);

/**
 * @route POST /api/organizer/notifications/read
 * @description Mark a specific notification as read.
 * @access Private (Organizer)
 */
router.post('/notifications/read', protect, organizer, markOrganizerNotificationRead);

/**
 * @route POST /api/organizer/notifications/read-all
 * @description Mark all notifications as read.
 * @access Private (Organizer)
 */
router.post('/notifications/read-all', protect, organizer, markAllOrganizerNotificationsRead);

/**
 * @route GET /api/organizer/events
 * @description Get all events created by the organizer.
 * @access Private (Organizer)
 */
/**
 * @route POST /api/organizer/events
 * @description Create a new event.
 * @access Private (Organizer)
 */
router
	.route('/events')
	.get(protect, organizer, getOrganizerEvents)
	.post(protect, organizer, createOrganizerEvent);

/**
 * @route GET /api/organizer/events/:id
 * @description Get details of a specific event created by the organizer.
 * @access Private (Organizer)
 */
router.get('/events/:id', protect, organizer, getOrganizerEventDetails);

module.exports = router;
