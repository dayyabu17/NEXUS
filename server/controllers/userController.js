const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const { updateUserTheme } = require('../services/authService');

/**
 * Update the authenticated user's theme preference.
 *
 * @route PUT /api/users/theme
 * @access Private
 */
const updateThemePreference = asyncHandler(async (req, res) => {
  const { theme } = req.body || {};
  const updatedUser = await updateUserTheme(req.user._id, theme);

  res.json({
    message: 'Theme preference updated successfully.',
    theme: updatedUser.theme,
  });
});

const getPublicUserProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid user id.' });
  }

  const user = await User.findById(id).select('name profilePicture createdAt regNo registrationNumber');

  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const eventsAttended = await Ticket.countDocuments({
    user: user._id,
    status: 'checked-in',
  });

  res.json({
    _id: user._id,
    name: user.name,
    profileImage: user.profilePicture || null,
    regNo: user.registrationNumber || user.regNo || null,
    joinedAt: user.createdAt || null,
    eventsAttended,
  });
});

module.exports = {
  updateThemePreference,
  getPublicUserProfile,
};
