const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Event = require('../models/Event');

/**
 * Retrieves statistics for the Admin Dashboard.
 * Returns counts of pending events, total users, total organizers, and total events.
 *
 * @function getAdminStats
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {void} Sends a JSON object with statistical data.
 */
const getAdminStats = asyncHandler(async (req, res) => {
  const pendingEventsCount = await Event.countDocuments({ status: 'pending' });
  const totalUsersCount = await User.countDocuments();
  const totalOrganizersCount = await User.countDocuments({ role: 'organizer' });
  const totalEventsCount = await Event.countDocuments();

  res.json({
    pendingApprovals: pendingEventsCount,
    totalUsers: totalUsersCount,
    totalOrganizers: totalOrganizersCount,
    totalEvents: totalEventsCount,
  });
});

/**
 * Retrieves a list of events with 'pending' status.
 * Populates organizer details.
 *
 * @function getPendingEvents
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {void} Sends a JSON array of pending events.
 */
const getPendingEvents = asyncHandler(async (req, res) => {
  const pendingEvents = await Event.find({ status: 'pending' })
    .populate('organizer', 'name organizationName')
    .sort({ createdAt: -1 });
  res.json(pendingEvents);
});

/**
 * Retrieves details of a single event by ID.
 * Populates organizer details.
 *
 * @function getEventDetails
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {void} Sends a JSON object with event details or a 404 error.
 */
const getEventDetails = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate('organizer', 'name email organizationName');
  if (!event) {
    // UPDATED: Send explicit JSON error
    return res.status(404).json({ message: 'Event not found' });
  }
  res.json(event);
});

/**
 * Updates the approval status of an event.
 *
 * @function updateEventStatus
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {void} Sends a JSON response with the update result.
 */
const updateEventStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }
  
  const event = await Event.findById(req.params.id);

  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }

  event.status = status;
  await event.save();

  res.json({ message: `Event ${status} successfully.`, eventId: event._id, newStatus: status });
});

/**
 * Retrieves a list of all users.
 * Excludes password field.
 *
 * @function getAllUsers
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {void} Sends a JSON array of user objects.
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password');
  res.json(users);
});

/**
 * Updates the role of a user.
 *
 * @function updateUserRole
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {void} Sends a JSON response with the update result.
 */
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!['admin', 'organizer', 'attendee'].includes(role)) {
    // UPDATED: Send explicit JSON error
    return res.status(400).json({ message: 'Invalid role value' });
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    // UPDATED: Send explicit JSON error
    return res.status(404).json({ message: 'User not found' });
  }

  // Prevent changing the role of the current admin user
  if (req.user._id.toString() === user._id.toString() && role !== 'admin') {
    // UPDATED: This was likely the cause of the silent fail. 
    // Now sending explicit JSON that the frontend can read.
    return res.status(403).json({ message: 'Cannot change your own role from admin via this endpoint' });
  }

  user.role = role;
  await user.save();

  res.json({ message: `User role updated to ${role} successfully.`, userId: user._id, newRole: role });
});

/**
 * Retrieves all events (for the main events list).
 * Populates organizer details.
 *
 * @function getAllEvents
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {void} Sends a JSON array of all events.
 */
const getAllEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({})
    .populate('organizer', 'name organizationName')
    .sort({ createdAt: -1 }); // Newest first
  res.json(events);
});

/**
 * Deletes an event by ID.
 *
 * @function deleteEvent
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {void} Sends a JSON response confirming deletion.
 */
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  await event.deleteOne(); // Use deleteOne() for Mongoose v6+

  res.json({ message: 'Event removed' });
});

module.exports = { 
    getAdminStats, 
    getPendingEvents, 
    getEventDetails, 
    updateEventStatus,
    getAllUsers,
    updateUserRole,
    getAllEvents,
    deleteEvent
};
