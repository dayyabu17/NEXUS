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
 * @module routes/adminRoutes
 * @description API routes for admin-only operations.
 */

/**
 * @route GET /api/admin/stats
 * @description Get dashboard statistics for the admin.
 * @access Private (Admin)
 */
router.route('/stats').get(protect, admin, getAdminStats);

/**
 * @route GET /api/admin/events/pending
 * @description Get a list of events pending approval.
 * @access Private (Admin)
 */
router.route('/events/pending').get(protect, admin, getPendingEvents);

/**
 * @route GET /api/admin/events/:id
 * @description Get details of a specific event.
 * @access Private (Admin)
 */
/**
 * @route DELETE /api/admin/events/:id
 * @description Delete a specific event.
 * @access Private (Admin)
 */
router.route('/events/:id')
    .get(protect, admin, getEventDetails)
    .delete(protect, admin, deleteEvent);

/**
 * @route PUT /api/admin/events/:id/status
 * @description Approve or reject an event.
 * @access Private (Admin)
 */
router.route('/events/:id/status')
    .put(protect, admin, updateEventStatus);

/**
 * @route GET /api/admin/users
 * @description Get a list of all users.
 * @access Private (Admin)
 */
router.route('/users')
    .get(protect, admin, getAllUsers);

/**
 * @route PUT /api/admin/users/:id/role
 * @description Update a user's role.
 * @access Private (Admin)
 */
router.route('/users/:id/role')
    .put(protect, admin, updateUserRole);

/**
 * @route GET /api/admin/events
 * @description Get a list of all events (for management).
 * @access Private (Admin)
 */
router.route('/events')
    .get(protect, admin, getAllEvents);

module.exports = router;
