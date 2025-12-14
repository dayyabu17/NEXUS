const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const Feedback = require('../models/Feedback');

const ALLOWED_TICKET_STATUSES = ['confirmed', 'checked-in'];

const normalizeRating = (rawRating) => {
  if (rawRating === undefined || rawRating === null || rawRating === '') {
    return undefined;
  }

  const parsed = Number(rawRating);
  if (!Number.isFinite(parsed)) {
    return NaN;
  }

  return parsed;
};

const serializeFeedback = (feedback) => {
  if (!feedback) {
    return null;
  }

  return {
    id: feedback._id,
    eventId: feedback.event,
    userId: feedback.user,
    message: feedback.message,
    rating: feedback.rating ?? null,
    createdAt: feedback.createdAt,
    updatedAt: feedback.updatedAt,
  };
};

// @desc    Submit or update feedback for an event the user attended
// @route   POST /api/events/:eventId/feedback
// @access  Private (Guest/Organizer/Admin with ticket)
const createEventFeedback = asyncHandler(async (req, res) => {
  const eventId = req.params.eventId || req.params.id;
  if (!eventId) {
    return res.status(400).json({ message: 'Event id is required.' });
  }
  const { message, rating } = req.body || {};

  const trimmedMessage = typeof message === 'string' ? message.trim() : '';
  if (trimmedMessage.length < 5) {
    return res.status(400).json({ message: 'Feedback message must be at least 5 characters.' });
  }

  const event = await Event.findById(eventId).select('date');
  if (!event) {
    return res.status(404).json({ message: 'Event not found.' });
  }

  const eventStart = event.date ? new Date(event.date) : null;
  if (!eventStart || Number.isNaN(eventStart.getTime())) {
    return res.status(400).json({ message: 'Event start time is invalid.' });
  }

  if (eventStart.getTime() > Date.now()) {
    return res.status(400).json({ message: 'Feedback opens once the event has started.' });
  }

  const ticket = await Ticket.findOne({
    event: event._id,
    user: req.user._id,
    status: { $in: ALLOWED_TICKET_STATUSES },
  })
    .select('_id');

  if (!ticket) {
    return res.status(403).json({ message: 'You need a valid ticket to leave feedback.' });
  }

  const parsedRating = normalizeRating(rating);
  if (Number.isNaN(parsedRating)) {
    return res.status(400).json({ message: 'Rating must be a number between 1 and 5.' });
  }

  if (parsedRating !== undefined && (parsedRating < 1 || parsedRating > 5)) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
  }

  let feedback = await Feedback.findOne({ event: event._id, user: req.user._id });

  if (feedback) {
    feedback.message = trimmedMessage;
    if (parsedRating === undefined) {
      feedback.rating = undefined;
    } else {
      feedback.rating = parsedRating;
    }
  } else {
    feedback = new Feedback({
      event: event._id,
      user: req.user._id,
      message: trimmedMessage,
    });

    if (parsedRating !== undefined) {
      feedback.rating = parsedRating;
    }
  }

  await feedback.save();

  res.status(200).json({ success: true, feedback: serializeFeedback(feedback) });
});

// @desc    Get feedback submitted by the current user for an event
// @route   GET /api/events/:eventId/feedback/me
// @access  Private
const getMyEventFeedback = asyncHandler(async (req, res) => {
  const eventId = req.params.eventId || req.params.id;
  if (!eventId) {
    return res.status(400).json({ message: 'Event id is required.' });
  }

  const event = await Event.findById(eventId).select('_id');
  if (!event) {
    return res.status(404).json({ message: 'Event not found.' });
  }

  const feedback = await Feedback.findOne({ event: event._id, user: req.user._id });

  res.status(200).json({ success: true, feedback: serializeFeedback(feedback) });
});

// @desc    Get feedback for an organizer's event
// @route   GET /api/organizer/events/:eventId/feedback
// @access  Private (Organizer)
const getOrganizerEventFeedback = asyncHandler(async (req, res) => {
  const eventId = req.params.eventId || req.params.id;
  if (!eventId) {
    return res.status(400).json({ message: 'Event id is required.' });
  }

  const event = await Event.findOne({ _id: eventId, organizer: req.user._id })
    .select('_id title');

  if (!event) {
    return res.status(404).json({ message: 'Event not found.' });
  }

  const feedbackDocuments = await Feedback.find({ event: event._id })
    .populate('user', 'name email profilePicture')
    .sort({ createdAt: -1 });

  const feedback = feedbackDocuments.map((entry) => ({
    id: entry._id,
    message: entry.message,
    rating: entry.rating ?? null,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
    user: entry.user
      ? {
          id: entry.user._id,
          name: entry.user.name || 'Anonymous attendee',
          email: entry.user.email || 'unknown@nexus.app',
          avatar: entry.user.profilePicture || null,
        }
      : {
          id: null,
          name: 'Anonymous attendee',
          email: 'unknown@nexus.app',
          avatar: null,
        },
  }));

  res.status(200).json({ success: true, feedback });
});

module.exports = {
  createEventFeedback,
  getMyEventFeedback,
  getOrganizerEventFeedback,
};
