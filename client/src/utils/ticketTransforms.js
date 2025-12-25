const coerceStringId = (value) => {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value === 'string') {
    return value;
  }

  try {
    return value.toString();
  } catch {
    return `${value}`;
  }
};

export const resolveEventId = (entity) => {
  if (!entity || typeof entity !== 'object') {
    return null;
  }

  const candidate = entity.eventId ?? entity._id ?? entity.id;
  return coerceStringId(candidate);
};

export const normalizeEventRecord = (event) => {
  if (!event) {
    return null;
  }

  const eventId = resolveEventId(event);
  if (!eventId || event.eventId === eventId) {
    return event;
  }

  return { ...event, eventId };
};

export const dedupeEventsById = (events = []) => {
  if (!Array.isArray(events)) {
    return [];
  }

  const seen = new Set();
  const normalized = [];

  events.forEach((event) => {
    const next = normalizeEventRecord(event);
    if (!next) {
      return;
    }

    const eventId = resolveEventId(next);
    if (eventId && seen.has(eventId)) {
      return;
    }

    if (eventId) {
      seen.add(eventId);
    }

    normalized.push(next);
  });

  return normalized;
};

export const normalizeTicketSummary = (ticket, now = Date.now()) => {
  if (!ticket) {
    return null;
  }

  const event = ticket.event || {};
  const eventDateValue = event.date ? new Date(event.date) : null;
  const eventDate = eventDateValue && !Number.isNaN(eventDateValue.valueOf()) ? eventDateValue : null;
  const timestamp = eventDate ? eventDate.getTime() : Number.NaN;
  const isUpcoming = Number.isFinite(timestamp) ? timestamp >= now : false;

  const idSource = ticket._id ?? ticket.id ?? resolveEventId(event);
  const id = coerceStringId(idSource) || Math.random().toString(36).slice(2);

  return {
    id,
    ticketId: coerceStringId(ticket._id ?? ticket.id),
    eventId: resolveEventId(event),
    title: event.title || 'Unnamed Experience',
    location: event.location || 'Location TBA',
    date: eventDate,
    isUpcoming,
  };
};

export const summarizeTicketCollection = (tickets, now = Date.now()) => {
  if (!Array.isArray(tickets) || tickets.length === 0) {
    return {
      summaries: [],
      metrics: { total: 0, upcoming: 0, past: 0 },
    };
  }

  let upcoming = 0;
  let past = 0;
  const summaries = [];

  tickets.forEach((ticket) => {
    const summary = normalizeTicketSummary(ticket, now);
    if (!summary) {
      return;
    }

    summaries.push(summary);
    if (summary.isUpcoming) {
      upcoming += 1;
    } else {
      past += 1;
    }
  });

  summaries.sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0));

  return {
    summaries,
    metrics: {
      total: summaries.length,
      upcoming,
      past: Math.max(past, 0),
    },
  };
};

export const normalizeGuestTicket = (ticket) => {
  if (!ticket) {
    return null;
  }

  const user = ticket.user || {};
  const status = ticket.status || (ticket.isCheckedIn ? 'checked-in' : 'confirmed');
  const isCheckedIn = Boolean(ticket.isCheckedIn || status === 'checked-in');
  const ticketId = coerceStringId(ticket._id ?? ticket.id);

  const checkedInAt = isCheckedIn
    ? ticket.checkedInAt || ticket.updatedAt || ticket.createdAt || null
    : null;

  return {
    id: ticketId || coerceStringId(user._id) || coerceStringId(ticket.email) || Math.random().toString(36).slice(2),
    name: user.name || 'Unknown Guest',
    email: user.email || ticket.email || 'unknown@nexus.app',
    status,
    ticketId,
    avatar: user.profilePicture || null,
    checkedInAt,
    isCheckedIn,
    userId: coerceStringId(user._id ?? user.id ?? ticket.userId ?? ticket.user) || null,
  };
};
