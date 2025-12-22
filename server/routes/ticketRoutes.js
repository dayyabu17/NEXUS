const express = require('express');
const { getMyTickets, getTicketStatus, purgeTickets } = require('../controllers/ticketController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @route GET /api/tickets/my-tickets
 * @desc Get all tickets for the current user.
 * @access Private
 */
router.get('/my-tickets', protect, getMyTickets);

/**
 * @route GET /api/tickets/status/:eventId
 * @desc Check if user has a ticket for an event.
 * @access Private
 */
router.get('/status/:eventId', protect, getTicketStatus);

/**
 * @route GET /api/tickets/purge
 * @desc Delete all tickets (dev only).
 * @access Public
 */
router.get('/purge', purgeTickets);

module.exports = router;
