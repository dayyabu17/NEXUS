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

// @desc    Get a single public event
// @route   GET /api/events/:id
// @access  Public
const getPublicEventById = asyncHandler(async (req, res) => {
  const event = await Event.findOne({ _id: req.params.id, status: 'approved' })
    .populate('organizer', 'name email organizationName profilePicture')
    .lean();

  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }

  res.status(200).json(event);
});

module.exports = {
  getPublicEvents,
  getPublicEventById,
};
