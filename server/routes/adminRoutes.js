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

// Dashboard Stats & Pending List
router.route('/stats').get(protect, admin, getAdminStats);
router.route('/events/pending').get(protect, admin, getPendingEvents);

// Single Event Details & Status Update
router.route('/events/:id')
    .get(protect, admin, getEventDetails); // GET details by ID

router.route('/events/:id/status')
    .put(protect, admin, updateEventStatus); // PUT status update
// User Management Routes
router.route('/users')
    .get(protect, admin, getAllUsers); // GET all users

router.route('/users/:id/role')
    .put(protect, admin, updateUserRole); // PUT update user role

// Additional Admin Routes for Event Management
router.route('/events')
    .get(protect, admin, getAllEvents); // GET all events
router.route('/events/:id')
    .delete(protect, admin, deleteEvent); // DELETE an event

module.exports = router;