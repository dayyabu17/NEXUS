const express = require("express");
const {
  getPublicEvents,
  getPublicEventById,
  getDashboardData,
  getGuestNotifications,
  markGuestNotificationRead,
  markAllGuestNotificationsRead,
} = require("../controllers/eventController");
const {
  createEventFeedback,
  getMyEventFeedback,
} = require("../controllers/feedbackController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @route GET /api/events/dashboard
 * @desc Get dashboard data (Hero, Recommended, Recent).
 * @access Public (Personalized if logged in)
 */
router.get("/dashboard", getDashboardData);

/**
 * @route GET /api/events/guest/notifications
 * @desc Get notifications for a guest.
 * @access Private
 */
router.get("/guest/notifications", protect, getGuestNotifications);

/**
 * @route POST /api/events/guest/notifications/read
 * @desc Mark a notification as read.
 * @access Private
 */
router.post("/guest/notifications/read", protect, markGuestNotificationRead);

/**
 * @route POST /api/events/guest/notifications/read-all
 * @desc Mark all guest notifications as read.
 * @access Private
 */
router.post(
  "/guest/notifications/read-all",
  protect,
  markAllGuestNotificationsRead,
);

/**
 * @route GET /api/events
 * @desc Get all public approved events.
 * @access Public
 */
router.get("/", getPublicEvents);

/**
 * @route POST /api/events/:id/feedback
 * @desc Create or update feedback for an event.
 * @access Private
 */
router.post("/:id/feedback", protect, createEventFeedback);

/**
 * @route GET /api/events/:id/feedback/me
 * @desc Get my feedback for an event.
 * @access Private
 */
router.get("/:id/feedback/me", protect, getMyEventFeedback);

/**
 * @route GET /api/events/:id
 * @desc Get public details of a single event.
 * @access Public
 */
router.get("/:id", getPublicEventById);

module.exports = router;
