const FRONTEND_BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const normalizeUrlBase = (value) => {
  if (typeof value !== 'string') {
    return '';
  }
  return value.endsWith('/') ? value.slice(0, -1) : value;
};

const buildEventUrl = (eventId) => `${normalizeUrlBase(FRONTEND_BASE_URL)}/events/${eventId}`;

const safeDate = (value) => {
  if (!value) {
    return null;
  }
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDateBlock = (event) => {
  const timezone = event.timezone || null;
  const start = safeDate(event.date);
  if (!start) {
    return {
      formattedDate: null,
      niceTime: null,
      combined: 'Schedule to be announced.',
    };
  }

  const dateFormatting = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  };

  const timeFormatting = {
    hour: 'numeric',
    minute: '2-digit',
  };

  if (timezone) {
    dateFormatting.timeZone = timezone;
    timeFormatting.timeZone = timezone;
  }

  const formattedDate = start.toLocaleDateString('en-US', dateFormatting);
  const startTime = start.toLocaleTimeString('en-US', timeFormatting);

  const endDate = safeDate(event.endDate);
  let niceTime = startTime;

  if (endDate) {
    const endTime = endDate.toLocaleTimeString('en-US', timeFormatting);
    niceTime = `${startTime} — ${endTime}`;
  } else if (event.endTime) {
    niceTime = `${startTime} — ${event.endTime}`;
  }

  if (timezone) {
    niceTime = `${niceTime} (${timezone})`;
  }

  const combined = niceTime
    ? `${formattedDate}, ${niceTime}`
    : `${formattedDate}${timezone ? ` (${timezone})` : ''}`;

  return {
    formattedDate,
    niceTime,
    combined,
  };
};

const toOptionalNumber = (value) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const formatCurrency = (amount, currency = 'NGN') => {
  const parsed = Number(amount);
  const numericAmount = Number.isFinite(parsed) ? parsed : 0;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);
};

const normalizeTags = (tags) => {
  if (Array.isArray(tags)) {
    return tags.map((tag) => tag?.toString().trim()).filter(Boolean);
  }
  if (typeof tags === 'string') {
    return tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return undefined;
};

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

    const createdAt =
      payload.createdAt instanceof Date ? payload.createdAt : new Date(payload.createdAt);
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
        createdAt: new Date(eventDate.getTime() + 12 * 60 * 60 * 1000),
      });
    }
  });

  return notifications.sort((a, b) => b.createdAt - a.createdAt);
};

module.exports = {
  safeDate,
  formatDateBlock,
  toOptionalNumber,
  formatCurrency,
  normalizeTags,
  buildEventUrl,
  buildGuestNotifications,
};
