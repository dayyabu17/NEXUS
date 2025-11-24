const express = require('express');
const router = express.Router();
const { 
    getAdminStats, 
    getPendingEvents, 
    getEventDetails,
    updateEventStatus,
    getAllUsers,
    updateUserRole,
    getAllEvents,
    deleteEvent
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/admin/stats
 * @desc    Get dashboard statistics
 * @access  Private (Admin)
 */
router.route('/stats').get(protect, admin, getAdminStats);

/**
 * @route   GET /api/admin/events/pending
 * @desc    Get all pending events
 * @access  Private (Admin)
 */
router.route('/events/pending').get(protect, admin, getPendingEvents);

/**
 * @route   GET /api/admin/events/:id
 * @desc    Get details of a specific event
 * @access  Private (Admin)
 */
router.route('/events/:id')
    .get(protect, admin, getEventDetails);

/**
 * @route   PUT /api/admin/events/:id/status
 * @desc    Update the status of an event
 * @access  Private (Admin)
 */
router.route('/events/:id/status')
    .put(protect, admin, updateEventStatus);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Private (Admin)
 */
router.route('/users')
    .get(protect, admin, getAllUsers);

/**
 * @route   PUT /api/admin/users/:id/role
 * @desc    Update a user's role
 * @access  Private (Admin)
 */
router.route('/users/:id/role')
    .put(protect, admin, updateUserRole);

/**
 * @route   GET /api/admin/events
 * @desc    Get all events
 * @access  Private (Admin)
 */
router.route('/events')
    .get(protect, admin, getAllEvents);

/**
 * @route   DELETE /api/admin/events/:id
 * @desc    Delete an event
 * @access  Private (Admin)
 */
router.route('/events/:id')
    .delete(protect, admin, deleteEvent);

module.exports = router;
