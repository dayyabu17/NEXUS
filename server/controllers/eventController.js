const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const { sendNotificationEmail } = require('../utils/emailService');

const DEFAULT_ACCENT = 'blue';
const DEFAULT_BRAND_COLOR = '#2563EB';
const STATUS_BADGE_COLORS = {
  approved: '#16a34a',
  rejected: '#dc2626',
};

const buildStatusChangeEmailHtml = ({
  organizerName,
  eventTitle,
  status,
  remarks,
}) => {
  const badgeColor = STATUS_BADGE_COLORS[status] || '#334155';
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);

  return `
    <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background-color: #0f172a; color: #e2e8f0; border-radius: 16px;">
      <h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 600; color: #f8fafc;">Event Status Update</h1>
      <p style="margin: 0 0 12px;">Hello ${organizerName || 'Organizer'},</p>
      <p style="margin: 0 0 20px;">Your event <strong>${eventTitle}</strong> has been updated.</p>
      <div style="margin-bottom: 20px;">
        <span style="display: inline-block; padding: 6px 14px; border-radius: 9999px; background-color: ${badgeColor}; color: #fff; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">${statusLabel}</span>
      </div>
      ${remarks ? `<p style="margin: 0 0 20px;">${remarks}</p>` : ''}
      <p style="margin: 0 0 16px;">Need assistance or have questions? Reply directly to this email and our team will help you out.</p>
      <p style="margin: 0; color: #94a3b8;">— The Nexus Events Team</p>
    </div>
  `;
};

/**
 * Get publicly visible events (approved).
 *
 * @description Retrieves a list of all approved events, sorted by date.
 * @route GET /api/events
 * @access Public
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {void}
 */
const getPublicEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ status: 'approved' })
    .sort({ date: 1 })
    .lean();

  res.json(events);
});

/**
 * Get a single public event by ID.
 *
 * @description Retrieves detailed information for a specific approved event, including limited organizer details.
 * @route GET /api/events/:id
 * @access Public
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {void}
 */
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

const buildGuestNotifications = (tickets, readSet = new Set()) => {
  const notifications = [];
  const seenIds = new Set();
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;
  const weekMs = 7 * dayMs;
  const followUpWindowMs = 3 * dayMs;

  const pushNotification = (payload) => {
    const { id } = payload;
    if (!id || seenIds.has(id)) {
      return;
    }

    const createdAt = payload.createdAt instanceof Date ? payload.createdAt : new Date(payload.createdAt);
    if (Number.isNaN(createdAt.getTime())) {
      return;
    }

    seenIds.add(id);
    notifications.push({
      ...payload,
      createdAt,
      isRead: readSet.has(id),
    });
  };

  tickets.forEach((ticket) => {
    const event = ticket?.event;
    if (!event || event.status !== 'approved') {
      return;
    }

    const eventId = event._id?.toString();
    if (!eventId) {
      return;
    }

    const ticketId = ticket._id?.toString() || eventId;
    const eventDate = event.date ? new Date(event.date) : null;
    const ticketCreated = ticket.createdAt ? new Date(ticket.createdAt) : null;
    const basePayload = {
      eventId,
      eventTitle: event.title,
      eventDate: event.date,
      location: event.location,
      imageUrl: event.imageUrl,
      tone: 'info',
    };

    if (ticketCreated && !Number.isNaN(ticketCreated.getTime())) {
      pushNotification({
        ...basePayload,
        id: `guest:${ticketId}:confirmed`,
        type: 'ticket-confirmed',
        headline: 'Ticket confirmed',
        message: 'Your ticket is secured. We will keep you posted.',
        tone: 'success',
        createdAt: ticketCreated,
      });
    }

    if (!eventDate || Number.isNaN(eventDate.getTime())) {
      return;
    }

    const msUntilEvent = eventDate.getTime() - now.getTime();

    if (msUntilEvent >= 0 && msUntilEvent <= dayMs) {
      pushNotification({
        ...basePayload,
        id: `guest:${eventId}:reminder`,
        type: 'event-reminder',
        headline: 'Happening soon',
        message: 'Starts in less than a day. Double-check your schedule.',
        tone: 'highlight',
        createdAt: new Date(now),
      });
      return;
    }

    if (msUntilEvent >= dayMs && msUntilEvent <= weekMs) {
      pushNotification({
        ...basePayload,
        id: `guest:${eventId}:upcoming`,
        type: 'event-upcoming',
        headline: 'Upcoming event',
        message: 'Coming up this week. Tap in to stay prepared.',
        tone: 'info',
        createdAt: eventDate,
      });
      return;
    }

    const msSinceEvent = now.getTime() - eventDate.getTime();
    if (msSinceEvent >= 0 && msSinceEvent <= followUpWindowMs) {
      pushNotification({
        ...basePayload,
        id: `guest:${eventId}:completed`,
        type: 'event-complete',
        headline: 'Thanks for joining',
        message: 'Hope you enjoyed the experience. Share feedback with the organizer.',
        tone: 'default',
        createdAt: new Date(eventDate.getTime() + dayMs / 2),
      });
    }
  });

  return notifications.sort((a, b) => b.createdAt - a.createdAt);
};

/**
 * Get dashboard data (Hero, Recommended, Recent).
 *
 * @description Aggregates data for the user dashboard, including a hero event, recommended events based on interest, and recent events.
 * @route GET /api/events/dashboard
 * @access Public (Personalized if user ID is provided)
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {void}
 */
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

/**
 * Get guest notifications.
 *
 * @description Generates notifications for a guest based on their tickets and event statuses.
 * @route GET /api/events/notifications
 * @access Private
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {void}
 */
const getGuestNotifications = asyncHandler(async (req, res) => {
  const tickets = await Ticket.find({ user: req.user._id })
    .populate('event', 'title date location imageUrl status')
    .lean();

  const readSet = new Set(
    (req.user.notificationReads || []).filter((value) => typeof value === 'string' && value.startsWith('guest:')),
  );

  const notifications = buildGuestNotifications(tickets, readSet);
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  res.json({ notifications, unreadCount });
});

/**
 * Mark a single guest notification as read.
 *
 * @description Adds the notification ID to the user's read list.
 * @route PUT /api/events/notifications/read
 * @access Private
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {void}
 */
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
    (updatedUser?.notificationReads || []).filter((value) => typeof value === 'string' && value.startsWith('guest:')),
  );

  const notifications = buildGuestNotifications(tickets, readSet);
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  res.json({ success: true, unreadCount });
});

/**
 * Mark all guest notifications as read.
 *
 * @description Marks all currently pending notifications for the user as read.
 * @route PUT /api/events/notifications/read-all
 * @access Private
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {void}
 */
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

/**
 * Update event status (alternative endpoint/logic).
 *
 * @description Updates event status and sends email notifications to the organizer.
 * @route PUT /api/events/:id/status
 * @access Private (Admin)
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {void}
 */
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
          const statusLabel = status === 'approved' ? 'Approved' : 'Rejected';
          const subject = `Event ${statusLabel}: ${event.title}`;
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
    newStatus: status,
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
};
