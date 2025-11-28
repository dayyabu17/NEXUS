const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');
const User = require('../models/User');

/**
 * @module controllers/organizerController
 * @description Controller for handling organizer-related operations, including dashboard stats, event management, and notifications.
 */

/**
 * Calculates the percentage change between two values.
 *
 * @function calculatePercentageChange
 * @param {number} current - The current value.
 * @param {number} previous - The previous value.
 * @returns {number} The percentage change, rounded to 1 decimal place.
 */
const calculatePercentageChange = (current, previous) => {
  if (!previous) {
    return current === 0 ? 0 : 100;
  }

  const change = ((current - previous) / previous) * 100;
  return Number(change.toFixed(1));
};

/**
 * Returns the singular or plural form of a word based on the count.
 *
 * @function pluralize
 * @param {number} count - The count.
 * @param {string} singular - The singular form of the word.
 * @param {string} plural - The plural form of the word.
 * @returns {string} The correct form of the word.
 */
const pluralize = (count, singular, plural) => (count === 1 ? singular : plural);

/**
 * Builds a list of notifications based on event activities.
 *
 * @function buildNotifications
 * @param {Array<Object>} events - The list of events.
 * @param {Set<string>} [readSet=new Set()] - A set of read notification IDs.
 * @returns {Array<Object>} A sorted list of notification objects.
 */
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

/**
 * Retrieves the dashboard data for an organizer.
 * Includes statistics, upcoming events, recent activities, and notifications.
 *
 * @function getOrganizerDashboard
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Promise<void>} Sends a JSON response with dashboard data.
 * @throws {Error} - Throws an error if the database query fails.
 */
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

/**
 * Retrieves notifications for an organizer.
 *
 * @function getOrganizerNotifications
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Promise<void>} Sends a JSON response with notifications and unread count.
 */
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

/**
 * Marks a specific notification as read for an organizer.
 *
 * @function markOrganizerNotificationRead
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The request body.
 * @param {String} req.body.id - The notification ID to mark as read.
 * @param {Object} res - The Express response object.
 * @returns {Promise<void>} Sends a JSON response with success status and updated unread count.
 * @throws {Error} - Returns a 400 error if ID is missing.
 */
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

/**
 * Marks all notifications as read for an organizer.
 *
 * @function markAllOrganizerNotificationsRead
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Promise<void>} Sends a JSON response with success status and unread count of 0.
 */
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

/**
 * Retrieves events created by the organizer.
 * Supports filtering by status and searching by title.
 *
 * @function getOrganizerEvents
 * @param {Object} req - The Express request object.
 * @param {Object} req.query - The query parameters.
 * @param {String} [req.query.status] - Filter by event status ('pending', 'approved', 'rejected').
 * @param {String} [req.query.search] - Search by event title.
 * @param {Object} res - The Express response object.
 * @returns {Promise<void>} Sends a JSON response with the list of events.
 */
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

/**
 * Retrieves details for a specific event created by the organizer.
 *
 * @function getOrganizerEventDetails
 * @param {Object} req - The Express request object.
 * @param {Object} req.params - The route parameters.
 * @param {String} req.params.id - The ID of the event.
 * @param {Object} res - The Express response object.
 * @returns {Promise<void>} Sends a JSON response with event details.
 * @throws {Error} - Returns a 404 error if the event is not found.
 */
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

/**
 * Creates a new event for the organizer.
 *
 * @function createOrganizerEvent
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The request body containing event details.
 * @param {Object} res - The Express response object.
 * @returns {Promise<void>} Sends a JSON response with the created event details.
 * @throws {Error} - Returns a 400 error if required fields are missing or invalid.
 */
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
};
