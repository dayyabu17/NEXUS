const upload = require('../utils/fileUpload');
const asyncHandler = require('express-async-handler');
const {
  authenticateUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  updateProfilePicture,
} = require('../services/authService');

/**
 * Authenticate user and get token.
 *
 * @description Authenticates a user by email and password. Returns user data and a JWT token upon success.
 * @route POST /api/auth/login
 * @access Public
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {void}
 */
const loginUser = asyncHandler(async (req, res) => {
  try {
    const { profile, token } = await authenticateUser(req.body || {});
    res.json({ ...profile, token });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message || 'Server Error' });
  }
});

/**
 * Register a new user.
 *
 * @description Registers a new user with the provided details. Hashes the password and creates a user record.
 * @route POST /api/auth/register
 * @access Public
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {void}
 */
const registerUserHandler = asyncHandler(async (req, res) => {
  try {
    await registerUser(req.body || {});
    res.status(201).json({ message: 'Registration successful. Please log in.' });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message || 'Server Error' });
  }
});
/**
 * Get user profile.
 *
 * @description Retrieves the profile information of the currently authenticated user.
 * @route GET /api/auth/profile
 * @access Private
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {void}
 */
const getUserProfileHandler = asyncHandler(async (req, res) => {
  try {
    const profile = await getUserProfile(req.user._id);
    res.json(profile);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message || 'Server Error' });
  }
});

/**
 * Update user profile.
 *
 * @description Updates the profile information (name, email, password) of the currently authenticated user.
 * @route PUT /api/auth/profile
 * @access Private
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {void}
 */
const updateUserProfileHandler = asyncHandler(async (req, res) => {
  try {
    const profile = await updateUserProfile(req.user._id, req.body || {});
    res.json(profile);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message || 'Server Error' });
  }
});

/**
 * Update user profile picture.
 *
 * @description Uploads and updates the user's profile picture.
 * @route PUT /api/auth/profile/picture
 * @access Private
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {void}
 */
const updateProfilePictureHandler = asyncHandler(async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      const message = typeof err === 'string' ? err : err?.message || 'Unable to upload image.';
      return res.status(400).json({ message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file selected for upload.' });
    }

    try {
      const relativePath = `/uploads/profile_pics/${req.file.filename}`;
      const result = await updateProfilePicture(req.user._id, relativePath);
      res.json(result);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server Error' });
    }
  });
});

module.exports = { 
  loginUser,
  registerUser: registerUserHandler,
  getUserProfile: getUserProfileHandler,
  updateUserProfile: updateUserProfileHandler,
  updateProfilePicture: updateProfilePictureHandler 
};