const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Event = require('../models/Event');

/**
 * @module controllers/adminController
 * @description Controller for handling admin-related operations such as managing events and users.
 */

/**
 * Retrieves statistics for the Admin Dashboard.
 * Includes counts for pending approvals, total users, total organizers, and total events.
 *
 * @function getAdminStats
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Promise<void>} Sends a JSON response with the statistics.
 * @throws {Error} - Throws an error if the database query fails (handled by asyncHandler).
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
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Promise<void>} Sends a JSON response with the list of pending events.
 * @throws {Error} - Throws an error if the database query fails.
 */
const getPendingEvents = asyncHandler(async (req, res) => {
  const pendingEvents = await Event.find({ status: 'pending' })
    .populate('organizer', 'name organizationName')
    .sort({ createdAt: -1 });
  res.json(pendingEvents);
});

/**
 * Retrieves details for a specific event by ID.
 * Populates organizer details.
 *
 * @function getEventDetails
 * @param {Object} req - The Express request object.
 * @param {Object} req.params - The route parameters.
 * @param {String} req.params.id - The ID of the event to retrieve.
 * @param {Object} res - The Express response object.
 * @returns {Promise<void>} Sends a JSON response with the event details.
 * @throws {Error} - Returns a 404 error if the event is not found.
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
 * Valid statuses are 'approved' or 'rejected'.
 *
 * @function updateEventStatus
 * @param {Object} req - The Express request object.
 * @param {Object} req.params - The route parameters.
 * @param {String} req.params.id - The ID of the event to update.
 * @param {Object} req.body - The request body.
 * @param {String} req.body.status - The new status ('approved' or 'rejected').
 * @param {Object} res - The Express response object.
 * @returns {Promise<void>} Sends a JSON response confirming the update.
 * @throws {Error} - Returns a 400 error for invalid status, or 404 if event is not found.
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
 * Excludes password field from the result.
 *
 * @function getAllUsers
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Promise<void>} Sends a JSON response with the list of users.
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password');
  res.json(users);
});

/**
 * Updates a user's role.
 *
 * @function updateUserRole
 * @param {Object} req - The Express request object.
 * @param {Object} req.params - The route parameters.
 * @param {String} req.params.id - The ID of the user to update.
 * @param {Object} req.body - The request body.
 * @param {String} req.body.role - The new role ('admin', 'organizer', 'attendee').
 * @param {Object} res - The Express response object.
 * @returns {Promise<void>} Sends a JSON response confirming the update.
 * @throws {Error} - Returns a 400 for invalid role, 404 if user not found, or 403 if trying to change own admin role.
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
 * Retrieves all events in the system.
 * Populates organizer details and sorts by creation date (descending).
 *
 * @function getAllEvents
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Promise<void>} Sends a JSON response with the list of events.
 */
const getAllEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({})
    .populate('organizer', 'name organizationName')
    .sort({ createdAt: -1 }); // Newest first
  res.json(events);
});

/**
 * Deletes a specific event by ID.
 *
 * @function deleteEvent
 * @param {Object} req - The Express request object.
 * @param {Object} req.params - The route parameters.
 * @param {String} req.params.id - The ID of the event to delete.
 * @param {Object} res - The Express response object.
 * @returns {Promise<void>} Sends a JSON response confirming deletion.
 * @throws {Error} - Returns a 404 error if the event is not found.
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
