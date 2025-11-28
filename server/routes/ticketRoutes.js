const express = require('express');
const { getMyTickets, purgeTickets } = require('../controllers/ticketController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @module routes/ticketRoutes
 * @description API routes for ticket management.
 */

/**
 * @route GET /api/tickets/my-tickets
 * @description Get all tickets belonging to the authenticated user.
 * @access Private
 */
router.get('/my-tickets', protect, getMyTickets);

/**
 * @route GET /api/tickets/purge
 * @description Delete all tickets (Development/Test utility).
 * @access Public (Should be restricted in production)
 */
router.get('/purge', purgeTickets);

module.exports = router;
