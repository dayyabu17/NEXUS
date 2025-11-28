const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');
const User = require('../models/User');

const DEFAULT_ACCENT = 'blue';
const DEFAULT_BRAND_COLOR = '#2563EB';

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
    .populate(
      'organizer',
      'name email organizationName profilePicture accentPreference brandColor avatarRingEnabled',
    )
    .lean();

  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }

  const organizer = event.organizer || {};

  res.status(200).json({
    ...event,
    organizer: {
      ...organizer,
      accentPreference: organizer.accentPreference || DEFAULT_ACCENT,
      brandColor: organizer.brandColor || DEFAULT_BRAND_COLOR,
      avatarRingEnabled: Boolean(organizer.avatarRingEnabled),
    },
  });
});

const getDashboardData = asyncHandler(async (req, res) => {
  const now = new Date();
  const weekAhead = new Date(now);
  weekAhead.setDate(weekAhead.getDate() + 7);

  const baseUpcomingMatch = {
    status: 'approved',
    date: { $gte: now },
  };

  let heroEvent = await Event.findOne({ ...baseUpcomingMatch, isFeatured: true })
    .sort({ date: 1 })
    .lean();

  if (!heroEvent) {
    heroEvent = await Event.findOne({
      status: 'approved',
      date: { $gte: now, $lte: weekAhead },
    })
      .sort({ rsvpCount: -1 })
      .lean();
  }

  if (!heroEvent) {
    heroEvent = await Event.findOne(baseUpcomingMatch)
      .sort({ rsvpCount: -1 })
      .lean();
  }

  const heroId = heroEvent?._id?.toString();

  const { userId } = req.query;
  let interestCategories = [];

  if (userId) {
    const user = await User.findById(userId).select('interests');
    if (user && Array.isArray(user.interests) && user.interests.length > 0) {
      interestCategories = user.interests.filter((item) => typeof item === 'string' && item.trim().length > 0);
    }
  }

  const recommendedBaseMatch = {
    status: 'approved',
    date: { $gte: now },
  };

  let recommendedEvents = [];

  if (interestCategories.length > 0) {
    recommendedEvents = await Event.find({
      ...recommendedBaseMatch,
      category: { $in: interestCategories },
    })
      .sort({ rsvpCount: -1, createdAt: -1 })
      .limit(5)
      .lean();
  }

  if (recommendedEvents.length < 5) {
    const excludeIds = [heroId, ...recommendedEvents.map((event) => event._id?.toString())].filter(Boolean);
    const generalEvents = await Event.find({
      ...recommendedBaseMatch,
      ...(excludeIds.length > 0 ? { _id: { $nin: excludeIds } } : {}),
    })
      .sort({ rsvpCount: -1, createdAt: -1 })
      .limit(5 - recommendedEvents.length)
      .lean();

    recommendedEvents = [...recommendedEvents, ...generalEvents];
  }

  if (heroId) {
    recommendedEvents = recommendedEvents.filter((event) => event._id?.toString() !== heroId);
  }

  const recentMatch = {
    status: 'approved',
  };

  const recentEvents = await Event.find({
    ...recentMatch,
    ...(heroId ? { _id: { $ne: heroId } } : {}),
  })
    .sort({ createdAt: -1 })
    .limit(18)
    .lean();

  res.json({
    heroEvent: heroEvent || null,
    recommendedEvents,
    recentEvents,
  });
});

module.exports = {
  getPublicEvents,
  getPublicEventById,
  getDashboardData,
};
