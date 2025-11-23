const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Event = require('../models/Event');

// ... (getAdminStats and getPendingEvents and getEventDetails remain the same) ...
// You can keep them as they are, or copy the full file below.

// @desc    Get counts for Admin Dashboard
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

// @desc    Get pending events
const getPendingEvents = asyncHandler(async (req, res) => {
  const pendingEvents = await Event.find({ status: 'pending' })
    .populate('organizer', 'name organizationName')
    .sort({ createdAt: -1 });
  res.json(pendingEvents);
});

// @desc    Get single event details
const getEventDetails = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate('organizer', 'name email organizationName');
  if (!event) {
    // UPDATED: Send explicit JSON error
    return res.status(404).json({ message: 'Event not found' });
  }
  res.json(event);
});

// @desc    Approve or Reject an event
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

// @desc    Get all users
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password');
  res.json(users);
});

// @desc    Update a user's role
// @route   PUT /api/admin/users/:id/role
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

// @desc    Get ALL events (for the main events list)
// @route   GET /api/admin/events
// @access  Private (Admin Only)
const getAllEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({})
    .populate('organizer', 'name organizationName')
    .sort({ createdAt: -1 }); // Newest first
  res.json(events);
});

// @desc    Delete an event
// @route   DELETE /api/admin/events/:id
// @access  Private (Admin Only)
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