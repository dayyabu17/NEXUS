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

module.exports = { getOrganizerDashboard };
