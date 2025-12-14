const express = require('express');
const {
	getPublicEvents,
	getPublicEventById,
	getDashboardData,
	getGuestNotifications,
	markGuestNotificationRead,
	markAllGuestNotificationsRead,
} = require('../controllers/eventController');
const {
	createEventFeedback,
	getMyEventFeedback,
} = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/dashboard', getDashboardData);
router.get('/guest/notifications', protect, getGuestNotifications);
router.post('/guest/notifications/read', protect, markGuestNotificationRead);
router.post('/guest/notifications/read-all', protect, markAllGuestNotificationsRead);
router.get('/', getPublicEvents);
router.post('/:id/feedback', protect, createEventFeedback);
router.get('/:id/feedback/me', protect, getMyEventFeedback);
router.get('/:id', getPublicEventById);

module.exports = router;
