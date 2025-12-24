const express = require('express');
const { getMyTickets, getTicketStatus, purgeTickets, checkInUser } = require('../controllers/ticketController');
const { protect, organizer } = require('../middleware/authMiddleware');

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

/**
 * @route POST /api/tickets/check-in
 * @desc Check in a guest using ticketId or userId/eventId.
 * @access Private (Organizer)
 */
router.post('/check-in', protect, organizer, checkInUser);

module.exports = router;
