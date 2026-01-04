const asyncHandler = require('express-async-handler');
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

module.exports = {
  updateThemePreference,
};
