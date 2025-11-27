const asyncHandler = require('express-async-handler');
const Ticket = require('../models/Ticket');

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

const purgeTickets = asyncHandler(async (req, res) => {
  await Ticket.deleteMany({});
  console.log('All tickets deleted. Ready for fresh test.');
  res.send('All tickets deleted. Ready for fresh test.');
});

module.exports = {
  getMyTickets,
  purgeTickets,
};
