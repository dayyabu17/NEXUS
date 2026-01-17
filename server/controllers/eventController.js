const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const { sendNotificationEmail } = require('../utils/emailService');
const {
  safeDate,
  formatDateBlock,
  toOptionalNumber,
  normalizeTags,
  buildEventUrl,
  buildGuestNotifications,
} = require('../utils/eventHelpers');
const {
  buildStatusChangeEmailHtml,
  buildEventUpdateEmailHtml,
  buildEventCancellationEmailHtml,
} = require('../utils/emailTemplates');
const { DEFAULT_ACCENT, DEFAULT_BRAND_COLOR } = require('../config/themeDefaults');

const PARTICIPANT_STATUSES = ['confirmed', 'checked-in'];

const getPublicEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ status: 'approved' }).sort({ date: 1 }).lean();
  res.json(events);
});

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
    heroEvent = await Event.findOne(baseUpcomingMatch).sort({ date: 1 }).lean();
  }

  const heroId = heroEvent?._id?.toString() || null;

  const recommendedBaseMatch = {
    status: 'approved',
    date: { $gte: now },
    ...(heroId ? { _id: { $ne: heroId } } : {}),
  };

  const interestCategories = Array.isArray(req.user?.interests)
    ? req.user.interests.filter(Boolean)
    : [];

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
    const excludeIds = [
      heroId,
      ...recommendedEvents.map((event) => event._id?.toString()),
    ].filter(Boolean);

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
    recommendedEvents = recommendedEvents.filter(
      (event) => event._id?.toString() !== heroId,
    );
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

const getGuestNotifications = asyncHandler(async (req, res) => {
  const tickets = await Ticket.find({ user: req.user._id })
    .populate('event', 'title date location imageUrl status')
    .lean();

  const readSet = new Set(
    (req.user.notificationReads || []).filter(
      (value) => typeof value === 'string' && value.startsWith('guest:'),
    ),
  );

  const notifications = buildGuestNotifications(tickets, readSet);
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  res.json({ notifications, unreadCount });
});

const markGuestNotificationRead = asyncHandler(async (req, res) => {
  const { id } = req.body || {};

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
  const tickets = await Ticket.find({ user: req.user._id })
    .populate('event', 'title date location imageUrl status')
    .lean();

  const readSet = new Set(
    (updatedUser?.notificationReads || []).filter(
      (value) => typeof value === 'string' && value.startsWith('guest:'),
    ),
  );

  const notifications = buildGuestNotifications(tickets, readSet);
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  res.json({ success: true, unreadCount });
});

const markAllGuestNotificationsRead = asyncHandler(async (req, res) => {
  const tickets = await Ticket.find({ user: req.user._id })
    .populate('event', 'title date location imageUrl status')
    .lean();

  const notifications = buildGuestNotifications(tickets, new Set());
  const ids = notifications
    .map((notification) => notification.id)
    .filter((value) => typeof value === 'string' && value.startsWith('guest:'));

  if (ids.length > 0) {
    await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { notificationReads: { $each: ids } } },
      { new: false },
    );
  }

  res.json({ success: true, unreadCount: 0 });
});

const updateEventStatus = asyncHandler(async (req, res) => {
  const { status, remarks } = req.body || {};

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  const event = await Event.findById(req.params.id);

  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }

  const previousStatus = event.status;
  event.status = status;
  await event.save();

  if (['approved', 'rejected'].includes(status) && status !== previousStatus) {
    const organizerId = event.organizer?._id || event.organizer;
    if (organizerId) {
      try {
        const organizer = await User.findById(organizerId).select('email name organizationName');
        const organizerEmail = organizer?.email;

        if (organizerEmail) {
          const organizerName = organizer?.name || organizer?.organizationName || 'Organizer';
          const subject = `Event ${status.charAt(0).toUpperCase() + status.slice(1)}: ${event.title}`;
          const htmlContent = buildStatusChangeEmailHtml({
            organizerName,
            eventTitle: event.title,
            status,
            remarks: remarks && remarks.trim() ? remarks.trim() : undefined,
          });

          sendNotificationEmail(organizerEmail, subject, htmlContent).catch((error) => {
            console.error('Failed to queue event status notification email:', error);
          });
        } else {
          console.error('Organizer email not found; notification email skipped.', { eventId: event._id });
        }
      } catch (error) {
        console.error('Failed to fetch organizer for notification email:', error);
      }
    } else {
      console.error('Organizer reference missing on event; notification email skipped.', { eventId: event._id });
    }
  }

  res.json({
    message: `Event status updated to ${status}.`,
    eventId: event._id,
    previousStatus,
    newStatus: status,
  });
});

const gatherParticipants = async (eventId) => {
  const tickets = await Ticket.find({
    event: eventId,
    status: { $in: PARTICIPANT_STATUSES },
  })
    .populate('user', 'name email')
    .lean();

  const recipients = [];
  const seen = new Set();

  tickets.forEach((ticket) => {
    const email = ticket.user?.email || ticket.email;
    if (!email || seen.has(email)) {
      return;
    }
    seen.add(email);

    recipients.push({
      email,
      name: ticket.user?.name || ticket.name || 'there',
    });
  });

  return recipients;
};

const updateEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  console.log('Update Request Received', { eventId: id, requester: req.user._id });

  const existingEvent = await Event.findById(id).lean();

  if (!existingEvent) {
    return res.status(404).json({ message: 'Event not found.' });
  }

  const isAdmin = req.user.role === 'admin';
  const organizerId = existingEvent.organizer ? existingEvent.organizer.toString() : null;
  const requesterId = req.user._id ? req.user._id.toString() : null;

  if (!isAdmin && (!organizerId || organizerId !== requesterId)) {
    return res.status(403).json({ message: 'You can only update events you created.' });
  }

  const existingStartDate = safeDate(existingEvent.date);
  if (existingStartDate && existingStartDate < new Date()) {
    return res
      .status(400)
      .json({ message: 'Cannot modify or cancel an event that has already ended.' });
  }

  const {
    title,
    description,
    date,
    endDate,
    endTime,
    location,
    category,
    capacity,
    registrationFee,
    price,
    imageUrl,
    tags,
    timezone,
    isFeatured,
    locationLatitude,
    locationLongitude,
  } = req.body || {};

  const updates = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (date !== undefined) {
    const parsedDate = safeDate(date);
    if (!parsedDate) {
      return res.status(400).json({ message: 'Invalid start date provided.' });
    }
    updates.date = parsedDate;
  }
  if (endDate !== undefined) {
    const parsedEndDate = safeDate(endDate);
    if (!parsedEndDate) {
      return res.status(400).json({ message: 'Invalid end date provided.' });
    }
    updates.endDate = parsedEndDate;
  }
  if (endTime !== undefined) updates.endTime = endTime;
  if (location !== undefined) updates.location = location;
  if (category !== undefined) updates.category = category;
  if (timezone !== undefined) updates.timezone = timezone;
  if (isFeatured !== undefined) updates.isFeatured = Boolean(isFeatured);

  const normalizedCapacity = toOptionalNumber(capacity);
  if (capacity !== undefined) {
    if (normalizedCapacity === undefined || normalizedCapacity < 0) {
      return res.status(400).json({ message: 'Capacity must be a positive number.' });
    }
    updates.capacity = normalizedCapacity;
  }

  const normalizedFee = toOptionalNumber(registrationFee);
  if (registrationFee !== undefined) {
    if (normalizedFee === undefined || normalizedFee < 0) {
      return res.status(400).json({ message: 'Registration fee must be a positive number.' });
    }
    updates.registrationFee = Number(normalizedFee.toFixed(2));
  }

  const normalizedPrice = toOptionalNumber(price);
  if (price !== undefined) {
    if (normalizedPrice === undefined || normalizedPrice < 0) {
      return res.status(400).json({ message: 'Ticket price must be a positive number.' });
    }
    updates.price = Number(normalizedPrice.toFixed(2));
  }

  if (imageUrl !== undefined) updates.imageUrl = imageUrl;
  const normalizedTags = normalizeTags(tags);
  if (normalizedTags !== undefined) updates.tags = normalizedTags;

  const lat = toOptionalNumber(locationLatitude);
  if (locationLatitude !== undefined) {
    if (lat === undefined || lat < -90 || lat > 90) {
      return res.status(400).json({ message: 'Latitude must be between -90 and 90.' });
    }
    updates.locationLatitude = lat;
  }

  const lng = toOptionalNumber(locationLongitude);
  if (locationLongitude !== undefined) {
    if (lng === undefined || lng < -180 || lng > 180) {
      return res.status(400).json({ message: 'Longitude must be between -180 and 180.' });
    }
    updates.locationLongitude = lng;
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: 'No valid fields supplied for update.' });
  }

  const updatedEvent = await Event.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  })
    .populate('organizer', 'name email organizationName')
    .lean();

  if (!updatedEvent) {
    return res.status(404).json({ message: 'Event not found.' });
  }

  const recipients = await gatherParticipants(updatedEvent._id);
  console.log('Participants found:', recipients.length);
  const eventUrl = buildEventUrl(updatedEvent._id);
  const subject = `Updated itinerary: ${updatedEvent.title}`;

  let emailResults = [];
  try {
    if (recipients.length > 0) {
      emailResults = await Promise.allSettled(
        recipients.map(({ email, name }) =>
          sendNotificationEmail(
            email,
            subject,
            buildEventUpdateEmailHtml({
              recipientName: name,
              event: updatedEvent,
              eventUrl,
            }),
          ),
        ),
      );
    }
  } catch (emailError) {
    console.error('Event update email dispatch failed:', emailError);
  }

  const sent = emailResults.filter((result) => result.status === 'fulfilled').length;

  res.json({
    message: 'Event updated successfully.',
    event: updatedEvent,
    notifications: {
      attempted: recipients.length,
      delivered: sent,
    },
  });
});

const deleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const event = await Event.findById(id)
    .populate('organizer', 'name email organizationName')
    .lean();

  if (!event) {
    return res.status(404).json({ message: 'Event not found.' });
  }

  const eventStartDate = safeDate(event.date);
  if (eventStartDate && eventStartDate < new Date()) {
    return res
      .status(400)
      .json({ message: 'Cannot modify or cancel an event that has already ended.' });
  }

  const recipients = await gatherParticipants(event._id);
  if (event.organizer?.email) {
    recipients.push({
      email: event.organizer.email,
      name: event.organizer.name || event.organizer.organizationName || 'Organizer',
    });
  }

  const eventUrl = buildEventUrl(event._id);
  const subject = `Cancellation: ${event.title}`;

  const emailResults = await Promise.allSettled(
    recipients.map(({ email, name }) =>
      sendNotificationEmail(
        email,
        subject,
        buildEventCancellationEmailHtml({
          recipientName: name,
          event,
          eventUrl,
        }),
      ),
    ),
  );

  const sent = emailResults.filter((result) => result.status === 'fulfilled').length;

  await Ticket.deleteMany({ event: event._id });
  await Event.deleteOne({ _id: event._id });

  res.json({
    message: 'Event deleted successfully.',
    notifications: {
      attempted: recipients.length,
      delivered: sent,
    },
  });
});

module.exports = {
  getPublicEvents,
  getPublicEventById,
  getDashboardData,
  getGuestNotifications,
  markGuestNotificationRead,
  markAllGuestNotificationsRead,
  updateEventStatus,
  updateEvent,
  deleteEvent,
};
