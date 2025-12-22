const asyncHandler = require('express-async-handler');
const Ticket = require('../models/Ticket');

/**
 * Get current user's tickets.
 *
 * @description Retrieves a list of tickets purchased or reserved by the authenticated user.
 * @route GET /api/tickets/my-tickets
 * @access Private
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {void}
 */
const getMyTickets = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized request.' });
  }

  const tickets = await Ticket.find({ user: userId })
    .populate('event')
    .sort({ createdAt: -1 })
    .lean();

  return res.json({ success: true, tickets });
});

/**
 * Check ticket status for an event.
 *
 * @description Checks if the authenticated user has a valid ticket for a specific event.
 * @route GET /api/tickets/status/:eventId
 * @access Private
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {void}
 */
const getTicketStatus = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { eventId } = req.params;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized request.' });
  }

  if (!eventId) {
    return res.status(400).json({ success: false, message: 'Event id is required.' });
  }

  const ticket = await Ticket.findOne({
    user: userId,
    event: eventId,
    status: { $in: ['confirmed', 'checked-in'] },
  })
    .select('_id status createdAt')
    .lean();

  return res.json({
    success: true,
    hasTicket: Boolean(ticket),
    ticketId: ticket?._id || null,
  });
});

/**
 * Purge all tickets (Dev/Test only).
 *
 * @description Deletes all ticket records from the database. Use with caution.
 * @route POST /api/tickets/purge
 * @access Public (Should be restricted in production)
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {void}
 */
const purgeTickets = asyncHandler(async (req, res) => {
  await Ticket.deleteMany({});
  console.log('All tickets deleted. Ready for fresh test.');
  res.send('All tickets deleted. Ready for fresh test.');
});

module.exports = {
  getMyTickets,
  getTicketStatus,
  purgeTickets,
};
