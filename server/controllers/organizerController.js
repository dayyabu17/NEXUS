const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');

const calculatePercentageChange = (current, previous) => {
  if (!previous) {
    return current === 0 ? 0 : 100;
  }

  const change = ((current - previous) / previous) * 100;
  return Number(change.toFixed(1));
};

const getOrganizerDashboard = asyncHandler(async (req, res) => {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);

  const events = await Event.find({ organizer: req.user._id }).sort({ date: 1 });

  const upcomingEvents = events.filter((event) => event.date >= now);
  const previousWeekEvents = events.filter(
    (event) => event.date < now && event.date >= sevenDaysAgo,
  );

  const totalUpcomingRsvps = upcomingEvents.reduce(
    (sum, event) => sum + (event.rsvpCount || 0),
    0,
  );
  const previousWeekRsvps = previousWeekEvents.reduce(
    (sum, event) => sum + (event.rsvpCount || 0),
    0,
  );

  const totalRevenue = upcomingEvents.reduce(
    (sum, event) => sum + ((event.registrationFee || 0) * (event.rsvpCount || 0)),
    0,
  );
  const previousRevenue = previousWeekEvents.reduce(
    (sum, event) => sum + ((event.registrationFee || 0) * (event.rsvpCount || 0)),
    0,
  );

  const activeEvents = upcomingEvents.filter((event) => event.status === 'approved').length;
  const previousActiveEvents = previousWeekEvents.filter((event) => event.status === 'approved').length;

  const upcomingList = upcomingEvents
    .slice(0, 5)
    .map((event) => ({
      id: event._id,
      title: event.title,
      status: event.status,
      date: event.date,
      location: event.location,
      rsvpCount: event.rsvpCount || 0,
      registrationFee: event.registrationFee || 0,
      imageUrl: event.imageUrl,
    }));

  const activities = events
    .filter((event) => (event.rsvpCount || 0) > 0)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 5)
    .map((event) => ({
      id: `${event._id.toString()}-${event.updatedAt.getTime()}`,
      title: `New ticket sold for ${event.title}`,
      createdAt: event.updatedAt,
      rsvpCount: event.rsvpCount || 0,
    }));

  res.json({
    stats: {
      totalUpcomingRsvps,
      totalUpcomingRsvpsChange: calculatePercentageChange(totalUpcomingRsvps, previousWeekRsvps),
      totalRevenue,
      totalRevenueChange: calculatePercentageChange(totalRevenue, previousRevenue),
      activeEvents,
      activeEventsChange: calculatePercentageChange(activeEvents, previousActiveEvents),
    },
    upcomingEvents: upcomingList,
    activities,
  });
});

const getOrganizerEvents = asyncHandler(async (req, res) => {
  const { status, search } = req.query;

  const query = { organizer: req.user._id };

  if (status && ['pending', 'approved', 'rejected'].includes(status)) {
    query.status = status;
  }

  if (search) {
    query.title = { $regex: new RegExp(search, 'i') };
  }

  const events = await Event.find(query).sort({ date: 1 });

  res.json(events.map((event) => ({
    id: event._id,
    title: event.title,
    status: event.status,
    date: event.date,
    location: event.location,
    rsvpCount: event.rsvpCount || 0,
    registrationFee: event.registrationFee || 0,
    imageUrl: event.imageUrl,
    tags: event.tags || [],
    category: event.category,
  })));
});

const createOrganizerEvent = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    date,
    location,
    category,
    capacity,
    registrationFee,
    imageUrl,
    tags,
  } = req.body;

  if (!title || !description || !date || !location) {
    return res.status(400).json({ message: 'Title, description, date, and location are required.' });
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return res.status(400).json({ message: 'Invalid event date supplied.' });
  }

  const parsedTagsSource = Array.isArray(tags)
    ? tags
    : typeof tags === 'string'
      ? tags.split(',')
      : [];

  const normalizedTags = parsedTagsSource
    .map((tag) => (tag || '').toString().trim())
    .filter(Boolean);

  const normalizedCapacity =
    capacity === undefined || capacity === null || capacity === ''
      ? undefined
      : Number(capacity);

  if (normalizedCapacity !== undefined && Number.isNaN(normalizedCapacity)) {
    return res.status(400).json({ message: 'Capacity must be a valid number.' });
  }

  const normalizedFee =
    registrationFee === undefined || registrationFee === null || registrationFee === ''
      ? 0
      : Number(registrationFee);

  if (Number.isNaN(normalizedFee)) {
    return res.status(400).json({ message: 'Registration fee must be a valid number.' });
  }

  const event = await Event.create({
    title: title.trim(),
    description,
    date: parsedDate,
    location: location.trim(),
    category: category ? category.trim() : undefined,
    capacity: normalizedCapacity,
    registrationFee: normalizedFee,
    imageUrl: imageUrl ? imageUrl.trim() : undefined,
    tags: normalizedTags,
    organizer: req.user._id,
    status: 'pending',
  });

  res.status(201).json({
    id: event._id,
    title: event.title,
    status: event.status,
    date: event.date,
    location: event.location,
    rsvpCount: event.rsvpCount || 0,
    registrationFee: event.registrationFee || 0,
    imageUrl: event.imageUrl,
    tags: event.tags,
    category: event.category,
  });
});

module.exports = { getOrganizerDashboard, getOrganizerEvents, createOrganizerEvent };
