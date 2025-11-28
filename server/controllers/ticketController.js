const asyncHandler = require('express-async-handler');
const Ticket = require('../models/Ticket');

/**
 * @module controllers/ticketController
 * @description Controller for handling ticket-related operations.
 */

/**
 * Retrieves all tickets purchased by the authenticated user.
 * Populates event details for each ticket.
 *
 * @function getMyTickets
 * @param {Object} req - The Express request object.
 * @param {Object} req.user - The authenticated user attached by middleware.
 * @param {String} req.user._id - The user's ID.
 * @param {Object} res - The Express response object.
 * @returns {Promise<void>} Sends a JSON response with the user's tickets.
 * @throws {Error} - Returns a 401 error if the user is not authenticated.
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
 * Deletes all tickets in the system.
 * Intended for development/testing purposes.
 *
 * @function purgeTickets
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Promise<void>} Sends a text response confirming deletion.
 */
const purgeTickets = asyncHandler(async (req, res) => {
  await Ticket.deleteMany({});
  console.log('All tickets deleted. Ready for fresh test.');
  res.send('All tickets deleted. Ready for fresh test.');
});

module.exports = {
  getMyTickets,
  purgeTickets,
};
