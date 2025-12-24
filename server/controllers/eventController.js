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
const PARTICIPANT_STATUSES = ['confirmed', 'checked-in'];
const MAGAZINE_DEEP_GREEN = '#1a3c34';
const MAGAZINE_MINT = '#5ff5c4';
const MAGAZINE_CANVAS = '#f5f9f7';
const FALLBACK_HERO =
  'https://images.unsplash.com/photo-1529158062015-cad636e69505?auto=format&fit=crop&w=1200&q=80';
const FRONTEND_BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const normalizeUrlBase = (value) => (value.endsWith('/') ? value.slice(0, -1) : value);
const buildEventUrl = (eventId) => `${normalizeUrlBase(FRONTEND_BASE_URL)}/events/${eventId}`;

const safeDate = (value) => {
  if (!value) return null;
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDateBlock = (event) => {
  const timezone = event.timezone || 'UTC';
  const start = safeDate(event.date);
  if (!start) {
    return 'Schedule to be announced.';
  }

  const formatting = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezone,
  };

  const startLabel = start.toLocaleString('en-US', formatting);
  const endDate = safeDate(event.endDate);
  let endLabel = '';

  if (endDate) {
    endLabel = endDate.toLocaleString('en-US', formatting);
  } else if (event.endTime) {
    endLabel = event.endTime;
  }

  return endLabel
    ? `${startLabel} — ${endLabel}${timezone ? ` (${timezone})` : ''}`
    : `${startLabel}${timezone ? ` (${timezone})` : ''}`;
};

const buildStatusChangeEmailHtml = ({ organizerName, eventTitle, status, remarks }) => {
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

const buildMagazineSection = ({ title, body }) => `
  <table width="100%" role="presentation" style="background-color: #ffffff; border-radius: 28px; padding: 24px 28px; margin-bottom: 16px;">
    <tr>
      <td>
        <p style="margin: 0 0 12px; font-family: 'Playfair Display','Georgia',serif; font-size: 18px; letter-spacing: 0.12em; text-transform: uppercase; color: ${MAGAZINE_DEEP_GREEN};">
          ${title}
        </p>
        <div style="font-family: 'Inter','Helvetica Neue',sans-serif; font-size: 14px; line-height: 1.7; color: #334155;">
          ${body}
        </div>
      </td>
    </tr>
  </table>
`;

const buildMagazineCTA = ({ label, url }) => `
  <table role="presentation" cellspacing="0" cellpadding="0" align="left" style="margin: 24px 0;">
    <tr>
      <td style="border-radius: 9999px; background: ${MAGAZINE_MINT}; padding: 12px 26px;">
        <a href="${url}" style="font-family: 'Inter','Helvetica Neue',sans-serif; font-size: 14px; color: ${MAGAZINE_DEEP_GREEN}; text-decoration: none; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;">
          ${label}
        </a>
      </td>
    </tr>
  </table>
`;

const buildMagazineShell = ({ heroTitle, heroSubtitle, heroImage, kicker, sections, cta, footerNote }) => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <title>${heroTitle}</title>
    </head>
    <body style="margin:0; padding:0; background:${MAGAZINE_CANVAS};">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation" style="background:${MAGAZINE_CANVAS}; padding: 32px 0;">
        <tr>
          <td align="center">
            <table width="640" border="0" cellspacing="0" cellpadding="0" role="presentation" style="background:#ffffff; border-radius:32px; overflow:hidden;">
              <tr>
                <td style="background:${MAGAZINE_DEEP_GREEN}; padding: 32px;">
                  <table width="100%" role="presentation">
                    <tr>
                      <td style="font-family:'Playfair Display','Georgia',serif; font-size:28px; font-weight:600; letter-spacing:0.16em; color:#ffffff; text-transform:uppercase;">
                        The Magazine
                      </td>
                      <td align="right" style="font-family:'Inter','Helvetica Neue',sans-serif; font-size:12px; letter-spacing:0.3em; color:#ffffff; text-transform:uppercase;">
                        ${kicker}
                      </td>
                    </tr>
                  </table>
                  <h1 style="margin:28px 0 12px; font-family:'Playfair Display','Georgia',serif; font-size:30px; line-height:1.2; color:#ffffff;">
                    ${heroTitle}
                  </h1>
                  <p style="margin:0; font-family:'Inter','Helvetica Neue',sans-serif; font-size:15px; line-height:1.7; color:#e2f5f0;">
                    ${heroSubtitle}
                  </p>
                </td>
              </tr>
              ${
                heroImage
                  ? `<tr>
                      <td>
                        <img src="${heroImage}" alt="" width="640" style="display:block; width:100%; height:auto;" />
                      </td>
                    </tr>`
                  : ''
              }
              <tr>
                <td style="padding: 32px;">
                  ${sections.join('')}
                  ${cta ? buildMagazineCTA(cta) : ''}
                  <table width="100%" role="presentation" style="margin-top:32px;">
                    <tr>
                      <td style="font-family:'Inter','Helvetica Neue',sans-serif; font-size:12px; color:#475569; text-align:center;">
                        ${footerNote}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="background:${MAGAZINE_DEEP_GREEN}; padding: 24px;">
                  <table width="100%" role="presentation">
                    <tr>
                      <td style="font-family:'Inter','Helvetica Neue',sans-serif; font-size:12px; letter-spacing:0.3em; text-transform:uppercase; color:${MAGAZINE_MINT};">
                        The Magazine
                      </td>
                      <td align="right" style="font-family:'Inter','Helvetica Neue',sans-serif; font-size:12px; color:#d1fae5;">
                        45T Washington Ave · Manchester, Kentucky 39485
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
`;

const buildEventUpdateEmailHtml = ({ recipientName, event, eventUrl, highlightList }) => {
  const heroTitle = `Fresh updates for “${event.title}”`;
  const heroSubtitle = `Curated just for ${recipientName || 'you'} — a closer look at what’s new.`;
  const kicker = `${new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })} • Update Bulletin`;
  const highlightBody =
    highlightList.length > 0
      ? `<ul style="padding-left:20px; margin:0; list-style:square; color:${MAGAZINE_DEEP_GREEN};">
          ${highlightList
            .map(
              (item) =>
                `<li style="margin-bottom:6px; font-size:14px; font-family:'Inter','Helvetica Neue',sans-serif;">
                  <strong>${item.label}:</strong> ${item.value}
                </li>`,
            )
            .join('')}
        </ul>`
      : `<p style="margin:0;">We’ve refined the experience to make it even better. Come take a look.</p>`;

  const sections = [
    buildMagazineSection({
      title: 'Notes from the organizer',
      body: `
        <p style="margin:0 0 14px;">Hi ${recipientName || 'there'},</p>
        <p style="margin:0 0 14px;">
          We’ve refreshed key details for <strong>${event.title}</strong>. Expect a richer atmosphere,
          fine-tuned timing, and smoother flow when you arrive.
        </p>
        <p style="margin:0;">
          Here’s a quick overview of what changed. Save the highlights so nothing catches you off guard.
        </p>
      `,
    }),
    buildMagazineSection({
      title: 'Highlights',
      body: highlightBody,
    }),
    buildMagazineSection({
      title: 'Event essentials',
      body: `
        <p style="margin:0 0 10px;"><strong>When:</strong> ${formatDateBlock(event)}</p>
        <p style="margin:0 0 10px;"><strong>Where:</strong> ${event.location || 'Venue to be announced.'}</p>
        <p style="margin:0;"><strong>Dress the vibe:</strong> ${event.category || 'General Gathering'}</p>
      `,
    }),
    buildMagazineSection({
      title: 'The experience',
      body: `
        <p style="margin:0;">
          ${event.description || 'Stay tuned — the organizer will share more shortly.'}
        </p>
      `,
    }),
  ];

  return buildMagazineShell({
    heroTitle,
    heroSubtitle,
    heroImage: event.imageUrl || FALLBACK_HERO,
    kicker,
    sections,
    cta: {
      label: 'View full update',
      url: eventUrl,
    },
    footerNote:
      'You are receiving this bulletin because you hold a confirmed ticket. Add us to your safe sender list to never miss a beat.',
  });
};

const buildEventCancellationEmailHtml = ({ recipientName, event, eventUrl }) => {
  const heroTitle = `“${event.title}” has been cancelled`;
  const heroSubtitle = `A quick word from the team about next steps, refunds, and staying in touch.`;
  const kicker = `${new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })} • Cancellation Notice`;

  const sections = [
    buildMagazineSection({
      title: 'Notes from the organizer',
      body: `
        <p style="margin:0 0 14px;">Hi ${recipientName || 'there'},</p>
        <p style="margin:0 0 14px;">
          We’re sorry to share that <strong>${event.title}</strong> will no longer take place on
          ${formatDateBlock(event)} at ${event.location || 'the planned venue'}.
        </p>
        <p style="margin:0;">
          We value your enthusiasm and wanted you to hear it directly from us first. Details on refunds
          and future announcements are below.
        </p>
      `,
    }),
    buildMagazineSection({
      title: 'Refund & follow-up',
      body: `
        <p style="margin:0 0 10px;">
          • Refunds will be processed automatically to your original payment method (if applicable).<br/>
          • Expect a confirmation email within the next 3–5 business days.<br/>
          • Keep an eye on your inbox for new dates or replacement experiences.
        </p>
      `,
    }),
    buildMagazineSection({
      title: 'Stay inspired',
      body: `
        <p style="margin:0;">
          Though this chapter closes, our calendar is still full of curated experiences. Browse the latest
          lineup and bookmark the ones that move you.
        </p>
      `,
    }),
  ];

  return buildMagazineShell({
    heroTitle,
    heroSubtitle,
    heroImage: event.imageUrl || FALLBACK_HERO,
    kicker,
    sections,
    cta: {
      label: 'Explore other events',
      url: eventUrl,
    },
    footerNote:
      'This cancellation alert was sent to confirmed guests. Reach us at support@nexus.com if you have questions about your ticket.',
  });
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
        createdAt: new Date(eventDate.getTime() + 12 * 60 * 60 * 1000),
      });
    }
  });

  return notifications.sort((a, b) => b.createdAt - a.createdAt);
};

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

  const interestCategories = Array.isArray(req.user?.interestCategories)
    ? req.user.interestCategories.filter(Boolean)
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

const toOptionalNumber = (value) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
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

const fieldLabels = {
  title: 'Title',
  description: 'Description',
  date: 'Schedule',
  endDate: 'End date',
  endTime: 'End time',
  location: 'Venue',
  category: 'Category',
  capacity: 'Capacity',
  registrationFee: 'Registration fee',
  price: 'Ticket price',
  imageUrl: 'Cover image',
  tags: 'Tags',
  timezone: 'Timezone',
  isFeatured: 'Featured placement',
  locationLatitude: 'Latitude',
  locationLongitude: 'Longitude',
};

const formatHighlightEntry = (key, value) => {
  const label = fieldLabels[key] || key;
  if (Array.isArray(value)) {
    return { label, value: value.join(', ') };
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return { label, value: value.toString() };
  }
  return { label, value: value || 'Updated' };
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

  const highlightFields = Object.entries(updates).map(([key, value]) => formatHighlightEntry(key, value));

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
              highlightList: highlightFields,
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
