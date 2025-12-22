const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Event = require('../models/Event');



/**
 * Get system statistics for the Admin Dashboard.
 *
 * @description Retrieves counts for pending events, total users, total organizers, and total events.
 * @route GET /api/admin/stats
 * @access Private (Admin)
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {void}
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
 * Get all pending events.
 *
 * @description Retrieves a list of events with 'pending' status, populated with organizer details.
 * @route GET /api/admin/events/pending
 * @access Private (Admin)
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {void}
 */
const getPendingEvents = asyncHandler(async (req, res) => {
  const pendingEvents = await Event.find({ status: 'pending' })
    .populate('organizer', 'name organizationName')
    .sort({ createdAt: -1 });
  res.json(pendingEvents);
});

/**
 * Get event details by ID.
 *
 * @description Retrieves detailed information about a specific event, including organizer details.
 * @route GET /api/admin/events/:id
 * @access Private (Admin)
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {void}
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
 * Update event status (Approve/Reject).
 *
 * @description Updates the status of a pending event to 'approved' or 'rejected'.
 * @route PUT /api/admin/events/:id
 * @access Private (Admin)
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {void}
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
 * Get all users.
 *
 * @description Retrieves a list of all users in the system, excluding passwords.
 * @route GET /api/admin/users
 * @access Private (Admin)
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {void}
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password');
  res.json(users);
});

/**
 * Update user role.
 *
 * @description Updates the role of a user. Prevents admin from changing their own role.
 * @route PUT /api/admin/users/:id/role
 * @access Private (Admin)
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {void}
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
 * Get all events.
 *
 * @description Retrieves all events in the system, populated with organizer details, sorted by creation date.
 * @route GET /api/admin/events
 * @access Private (Admin)
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {void}
 */
const getAllEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({})
    .populate('organizer', 'name organizationName')
    .sort({ createdAt: -1 }); // Newest first
  res.json(events);
});

/**
 * Delete an event.
 *
 * @description Permanently removes an event from the database.
 * @route DELETE /api/admin/events/:id
 * @access Private (Admin)
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {void}
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