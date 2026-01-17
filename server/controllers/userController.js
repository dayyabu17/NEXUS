const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const { updateUserTheme } = require('../services/authService');
const { validateInterests, normalizeInterests } = require('../utils/interestHelpers');

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

/**
 * Update the authenticated user's interests.
 *
 * @route PUT /api/users/interests
 * @description Update user's interest categories with validation (min 3, max 5)
 * @access Private
 */
const updateUserInterests = asyncHandler(async (req, res) => {
  const { interests } = req.body || {};

  // Normalize and validate interests
  const normalizedInterests = normalizeInterests(interests);
  const validation = validateInterests(normalizedInterests, 3, 5);

  if (!validation.isValid) {
    return res.status(400).json({
      message: validation.message,
    });
  }

  // Update user interests in database
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { interests: normalizedInterests },
    { new: true, runValidators: true }
  ).select('interests name email');

  if (!updatedUser) {
    return res.status(404).json({ message: 'User not found.' });
  }

  res.json({
    message: 'Interests updated successfully.',
    interests: updatedUser.interests,
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
  updateUserInterests,
};
