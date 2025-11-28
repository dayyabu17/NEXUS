const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');
const User = require('../models/User');
const Ticket = require('../models/Ticket');

const ACCENT_CHOICES = ['blue', 'purple', 'green', 'orange'];
const DEFAULT_ACCENT = 'blue';
const DEFAULT_BRAND_COLOR = '#2563EB';
const HEX_PATTERN = /^#([0-9A-Fa-f]{6})$/;

const calculatePercentageChange = (current, previous) => {
  if (!previous) {
    return current === 0 ? 0 : 100;
  }

  const change = ((current - previous) / previous) * 100;
  return Number(change.toFixed(1));
};

const pluralize = (count, singular, plural) => (count === 1 ? singular : plural);

const buildNotifications = (events, readSet = new Set()) => {
  const notifications = [];

  const pushNotification = (payload) => {
    if (!payload.createdAt) {
      return;
    }
    const notificationId = payload.id || `${payload.eventId}-${payload.type}`;
    notifications.push({
      ...payload,
      id: notificationId,
      isRead: readSet.has(notificationId),
    });
  };

  events.forEach((event) => {
    const basePayload = {
      eventId: event._id,
      eventTitle: event.title,
      imageUrl: event.imageUrl,
    };

    const ticketsSold = event.registrationFee > 0 ? event.rsvpCount || 0 : undefined;
    const rsvpTotal = event.registrationFee > 0 ? undefined : event.rsvpCount || 0;

    if (event.createdAt) {
      const id = `${event._id.toString()}-created`;
      pushNotification({
        ...basePayload,
        id,
        type: 'event-created',
        headline: 'Event created',
        message: 'Your event is awaiting approval.',
        tone: 'success',
        stats:
          ticketsSold !== undefined
            ? { ticketsSold }
            : rsvpTotal !== undefined
              ? { rsvpTotal }
              : undefined,
        createdAt: event.createdAt,
      });
    }

    if (
      event.updatedAt &&
      event.createdAt &&
      event.updatedAt.getTime() !== event.createdAt.getTime()
    ) {
      const id = `${event._id.toString()}-updated-${event.updatedAt.getTime()}`;
      pushNotification({
        ...basePayload,
        id,
        type: 'event-updated',
        headline: 'Event updated',
        message: 'Recent changes were saved successfully.',
        tone: 'info',
        stats:
          ticketsSold !== undefined
            ? { ticketsSold }
            : rsvpTotal !== undefined
              ? { rsvpTotal }
              : undefined,
        createdAt: event.updatedAt,
      });
    }

    const attendeeCount = event.rsvpCount || 0;
    if (attendeeCount > 0) {
      const noun = event.registrationFee > 0 ? 'ticket' : 'attendee';
      const verb = event.registrationFee > 0 ? 'were bought' : "RSVP'd";
      const headline = event.registrationFee > 0 ? 'Ticket sales' : 'New RSVPs';
      const id = `${event._id.toString()}-attendance-${attendeeCount}`;

      pushNotification({
        ...basePayload,
        id,
        type: 'attendance',
        headline,
        message: `${attendeeCount} ${pluralize(attendeeCount, noun, `${noun}s`)} ${verb}`,
        tone: event.registrationFee > 0 ? 'highlight' : 'info',
        stats: event.registrationFee > 0
          ? { ticketsSold: attendeeCount }
          : { rsvpTotal: attendeeCount },
        createdAt: event.updatedAt || event.createdAt,
      });
    }
  });

  return notifications
    .filter((notification) => notification.createdAt)
    .sort((a, b) => b.createdAt - a.createdAt);
};

const PLATFORM_FEE_RATE = 0.08;
const SETTLEMENT_WINDOW_DAYS = 3;

const getNextPayoutDate = (reference = new Date()) => {
  const date = new Date(reference);
  date.setHours(0, 0, 0, 0);
  const FRIDAY = 5;
  const day = date.getDay();
  let diff = FRIDAY - day;

  if (diff <= 0) {
    diff += 7;
  }

  date.setDate(date.getDate() + diff);
  return date;
};

const getOrganizerDashboard = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);
  const sevenDaysForward = new Date(startOfToday);
  sevenDaysForward.setDate(startOfToday.getDate() + 7);

  const events = await Event.find({ organizer: req.user._id }).sort({ date: 1 });

  const upcomingEvents = events.filter((event) => event.date >= now);
  const previousWeekEvents = events.filter(
    (event) => event.date < now && event.date >= sevenDaysAgo,
  );
  const upcomingWindowEvents = events.filter(
    (event) => event.date >= startOfToday && event.date < sevenDaysForward,
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

  const readSet = new Set(req.user.notificationReads || []);
  const notifications = buildNotifications(events, readSet);
  const activities = notifications.slice(0, 5).map((item) => ({
    id: item.id,
    title:
      item.message ||
      [item.headline, item.eventTitle].filter(Boolean).join(' · ') ||
      item.type,
    createdAt: item.createdAt,
  }));

  const trendBuckets = Array.from({ length: 7 }).map((_, index) => {
    const dayStart = new Date(startOfToday);
    dayStart.setDate(startOfToday.getDate() + index);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const dayEvents = upcomingWindowEvents.filter(
      (event) => event.date >= dayStart && event.date < dayEnd,
    );

    const rsvps = dayEvents.reduce((sum, event) => sum + (event.rsvpCount || 0), 0);
    const revenue = dayEvents.reduce(
      (sum, event) => sum + ((event.registrationFee || 0) * (event.rsvpCount || 0)),
      0,
    );
    const active = dayEvents.filter((event) => event.status === 'approved').length;

    return {
      date: dayStart.toISOString(),
      rsvps,
      revenue,
      active,
    };
  });

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
    notifications: notifications.slice(0, 20),
    unreadCount: notifications.filter((item) => !item.isRead).length,
    trends: {
      rsvps: trendBuckets.map((bucket) => ({ date: bucket.date, value: bucket.rsvps })),
      revenue: trendBuckets.map((bucket) => ({ date: bucket.date, value: bucket.revenue })),
      active: trendBuckets.map((bucket) => ({ date: bucket.date, value: bucket.active })),
    },
  });
});

const getOrganizerEarnings = asyncHandler(async (req, res) => {
  const events = await Event.find({ organizer: req.user._id }).select('_id title date');

  if (!events.length) {
    const fallbackPayoutDate = getNextPayoutDate();

    return res.json({
      metrics: {
        totalRevenue: 0,
        netIncome: 0,
        pendingPayout: 0,
        totalTickets: 0,
      },
      revenueTrend: [],
      transactions: [],
      payoutSummary: {
        nextPayoutDate: fallbackPayoutDate.toISOString(),
        averageSettlementDelayDays: 0,
        feeRate: PLATFORM_FEE_RATE,
      },
    });
  }

  const eventIds = events.map((event) => event._id);
  const settlementThreshold = new Date();
  settlementThreshold.setDate(settlementThreshold.getDate() - SETTLEMENT_WINDOW_DAYS);

  const tickets = await Ticket.find({
    event: { $in: eventIds },
  })
    .populate('event', 'title date')
    .populate('user', 'name email')
    .sort({ createdAt: -1 });

  let totalRevenue = 0;
  let totalTickets = 0;
  let pendingPayout = 0;
  const settlementDelays = [];
  const revenueByDay = new Map();

  tickets.forEach((ticket) => {
    const amount = Number(ticket.amountPaid) || 0;
    const quantity = Number(ticket.quantity) || 1;
    const createdAt = ticket.createdAt ? new Date(ticket.createdAt) : new Date();

    if (ticket.status === 'confirmed') {
      totalRevenue += amount;
      totalTickets += quantity;

      const dayKey = createdAt.toISOString().slice(0, 10);
      revenueByDay.set(dayKey, (revenueByDay.get(dayKey) || 0) + amount);

      const updatedAt = ticket.updatedAt ? new Date(ticket.updatedAt) : createdAt;
      const delayMs = Math.max(0, updatedAt.getTime() - createdAt.getTime());
      settlementDelays.push(delayMs);
    }

    if (ticket.status !== 'confirmed' || createdAt >= settlementThreshold) {
      pendingPayout += amount;
    }
  });

  const netIncome = Math.max(0, totalRevenue * (1 - PLATFORM_FEE_RATE));
  const now = new Date();
  const revenueTrend = [];

  for (let index = 29; index >= 0; index -= 1) {
    const day = new Date(now);
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - index);
    const key = day.toISOString().slice(0, 10);

    revenueTrend.push({
      date: day.toISOString(),
      revenue: revenueByDay.get(key) || 0,
    });
  }

  const averageDelayMs = settlementDelays.length
    ? settlementDelays.reduce((sum, delay) => sum + delay, 0) / settlementDelays.length
    : 0;
  const averageSettlementDelayDays = Number((averageDelayMs / (1000 * 60 * 60 * 24)).toFixed(1));

  const nextPayoutDate = getNextPayoutDate(now);

  const transactions = tickets.slice(0, 20).map((ticket) => {
    const amount = Number(ticket.amountPaid) || 0;
    const createdAt = ticket.createdAt ? new Date(ticket.createdAt) : new Date();
    const buyerName = ticket.user?.name || ticket.email || 'Attendee';
    const isSettled = ticket.status === 'confirmed' && createdAt < settlementThreshold;

    return {
      id: ticket._id,
      event: ticket.event?.title || 'Event',
      buyer: buyerName,
      amount,
      date: createdAt.toISOString(),
      status: isSettled ? 'Settled' : 'Processing',
    };
  });

  res.json({
    metrics: {
      totalRevenue: Math.round(totalRevenue),
      netIncome: Math.round(netIncome),
      pendingPayout: Math.round(pendingPayout),
      totalTickets,
    },
    revenueTrend,
    transactions,
    payoutSummary: {
      nextPayoutDate: nextPayoutDate.toISOString(),
      averageSettlementDelayDays,
      feeRate: PLATFORM_FEE_RATE,
    },
  });
});

const getOrganizerPreferences = asyncHandler(async (req, res) => {
  res.json({
    accentPreference: req.user?.accentPreference || DEFAULT_ACCENT,
    brandColor: req.user?.brandColor || DEFAULT_BRAND_COLOR,
    avatarRingEnabled: Boolean(req.user?.avatarRingEnabled),
  });
});

const updateOrganizerPreferences = asyncHandler(async (req, res) => {
  const { accentPreference, brandColor, avatarRingEnabled } = req.body || {};

  const updates = {};

  if (accentPreference !== undefined) {
    if (!ACCENT_CHOICES.includes(accentPreference)) {
      res.status(400);
      throw new Error('Accent selection is not supported.');
    }
    updates.accentPreference = accentPreference;
  }

  if (brandColor !== undefined) {
    if (typeof brandColor !== 'string' || !HEX_PATTERN.test(brandColor)) {
      res.status(400);
      throw new Error('Brand color must be a valid hex string.');
    }
    updates.brandColor = brandColor.toUpperCase();
  }

  if (avatarRingEnabled !== undefined) {
    updates.avatarRingEnabled = Boolean(avatarRingEnabled);
  }

  if (Object.keys(updates).length === 0) {
    res.status(400);
    throw new Error('No valid preference update supplied.');
  }

  const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  }).select('accentPreference brandColor avatarRingEnabled');

  res.json({
    accentPreference: updatedUser?.accentPreference || DEFAULT_ACCENT,
    brandColor: updatedUser?.brandColor || DEFAULT_BRAND_COLOR,
    avatarRingEnabled: Boolean(updatedUser?.avatarRingEnabled),
  });
});

const getOrganizerNotifications = asyncHandler(async (req, res) => {
  const events = await Event.find({ organizer: req.user._id }).sort({ date: 1 });
  const readSet = new Set(req.user.notificationReads || []);
  const notifications = buildNotifications(events, readSet);
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  res.json({
    notifications,
    unreadCount,
  });
});

const markOrganizerNotificationRead = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id || typeof id !== 'string') {
    res.status(400);
    throw new Error('Notification id is required.');
  }

  await User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { notificationReads: id } },
    { new: false },
  );

  const updatedUser = await User.findById(req.user._id).select('notificationReads');
  const events = await Event.find({ organizer: req.user._id }).sort({ date: 1 });
  const readSet = new Set(updatedUser?.notificationReads || []);
  const notifications = buildNotifications(events, readSet);
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  res.json({ success: true, unreadCount });
});

const markAllOrganizerNotificationsRead = asyncHandler(async (req, res) => {
  const events = await Event.find({ organizer: req.user._id }).sort({ date: 1 });
  const notifications = buildNotifications(events);
  const ids = [...new Set(notifications.map((notification) => notification.id))];

  await User.findByIdAndUpdate(
    req.user._id,
    { notificationReads: ids },
    { new: false },
  );

  res.json({ success: true, unreadCount: 0 });
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

const getOrganizerEventDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const event = await Event.findOne({ _id: id, organizer: req.user._id });

  if (!event) {
    return res.status(404).json({ message: 'Event not found.' });
  }

  res.json({
    id: event._id,
    title: event.title,
    description: event.description,
    date: event.date,
    location: event.location,
    status: event.status,
    category: event.category,
    capacity: event.capacity,
    registrationFee: event.registrationFee || 0,
    tags: event.tags || [],
    rsvpCount: event.rsvpCount || 0,
    imageUrl: event.imageUrl,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  });
});

const createOrganizerEvent = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    date,
    location,
    locationLatitude,
    locationLongitude,
    category,
    capacity,
    registrationFee,
    imageUrl,
    tags,
    timezone,
    endDate,
    endTime,
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

  const parseCoordinate = (value) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    const numericValue = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(numericValue) ? numericValue : undefined;
  };

  let parsedEndDate;
  if (endDate) {
    const candidate = new Date(endDate);
    if (!Number.isNaN(candidate.getTime())) {
      parsedEndDate = candidate;
    }
  }

  const sanitizedEndTime = typeof endTime === 'string' && endTime.trim().length > 0 ? endTime.trim() : undefined;

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
    locationLatitude: parseCoordinate(locationLatitude),
    locationLongitude: parseCoordinate(locationLongitude),
    timezone: typeof timezone === 'string' && timezone.trim().length > 0 ? timezone.trim() : undefined,
    endDate: parsedEndDate,
    endTime: sanitizedEndTime,
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
    locationLatitude: event.locationLatitude,
    locationLongitude: event.locationLongitude,
    timezone: event.timezone,
    endDate: event.endDate,
    endTime: event.endTime,
  });
});

module.exports = {
  getOrganizerDashboard,
  getOrganizerEvents,
  getOrganizerEventDetails,
  createOrganizerEvent,
  getOrganizerNotifications,
  markOrganizerNotificationRead,
  markAllOrganizerNotificationsRead,
  getOrganizerPreferences,
  updateOrganizerPreferences,
  getOrganizerEarnings,
};
