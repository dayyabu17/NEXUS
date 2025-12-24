const asyncHandler = require('express-async-handler');
const Ticket = require('../models/Ticket');
const Event = require('../models/Event');

const safeDate = (value) => {
  if (!value) {
    return null;
  }

  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const buildGuestPayload = (ticket) => {
  const user = ticket.user || {};

  return {
    id: ticket._id,
    ticketId: ticket._id,
    userId: user?._id || ticket.user || null,
    name: user?.name || ticket.name || 'Unknown Guest',
    email: user?.email || ticket.email || 'unknown@nexus.app',
    status: ticket.status,
    checkedInAt: ticket.checkedInAt || null,
    isCheckedIn: Boolean(ticket.isCheckedIn || ticket.status === 'checked-in'),
    avatar: user?.profilePicture || null,
  };
};

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

const checkInUser = asyncHandler(async (req, res) => {
  const { ticketId, userId, eventId } = req.body || {};

  if (!ticketId && (!userId || !eventId)) {
    return res
      .status(400)
      .json({ success: false, message: 'Provide a ticketId or both userId and eventId.' });
  }

  const query = ticketId ? { _id: ticketId } : { user: userId, event: eventId };

  const ticket = await Ticket.findOne(query)
    .populate('event', 'organizer date endDate title')
    .populate('user', 'name email profilePicture');

  if (!ticket) {
    return res.status(404).json({ success: false, message: 'Ticket not found for this guest.' });
  }

  const event = ticket.event || (await Event.findById(eventId).select('organizer date endDate title'));

  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found.' });
  }

  if (event.organizer?.toString() !== req.user._id.toString()) {
    return res
      .status(403)
      .json({ success: false, message: 'You do not have permission to manage check-ins for this event.' });
  }

  const now = new Date();
  const eventStart = safeDate(event.date);
  if (!eventStart) {
    return res.status(400).json({ success: false, message: 'Event start time is invalid.' });
  }

  if (now < eventStart) {
    return res.status(400).json({ success: false, message: 'Event not started.' });
  }

  const eventEnd = safeDate(event.endDate);
  if (eventEnd && now > eventEnd) {
    return res.status(400).json({ success: false, message: 'Event ended.' });
  }

  if (ticket.status === 'pending') {
    return res
      .status(400)
      .json({ success: false, message: 'Only confirmed tickets can be checked in.' });
  }

  ticket.status = 'checked-in';
  ticket.checkedInAt = now;
  ticket.isCheckedIn = true;

  await ticket.save();

  const guest = buildGuestPayload(ticket);

  return res.json({ success: true, guest });
});

module.exports = {
  getMyTickets,
  getTicketStatus,
  purgeTickets,
  checkInUser,
};
