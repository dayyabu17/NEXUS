const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');

// @desc    Get publicly visible events (approved)
// @route   GET /api/events
// @access  Public
const getPublicEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ status: 'approved' })
    .sort({ date: 1 })
    .lean();

  res.json(events);
});

module.exports = {
  getPublicEvents,
};
