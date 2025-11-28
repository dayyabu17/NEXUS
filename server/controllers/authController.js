const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const upload = require('../utils/fileUpload');
const asyncHandler = require('express-async-handler')

/**
 * @module controllers/authController
 * @description Controller for handling authentication and user profile management.
 */

/**
 * Authenticates a user and issues a JWT token.
 *
 * @function loginUser
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The request body.
 * @param {String} req.body.email - The user's email.
 * @param {String} req.body.password - The user's password.
 * @param {Object} res - The Express response object.
 * @returns {Promise<void>} Sends a JSON response with user details and JWT token.
 * @throws {Error} - Returns a 400 error if credentials are invalid or 500 for server errors.
 */
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // --- DEBUGGING LOGS START ---
  console.log('Attempting login...');
  console.log('Received email:', email);
  console.log('Received password (raw):', password); // Be careful with this in production!
  // --- DEBUGGING LOGS END ---

  try {
    // 1. Check if user exists
    const user = await User.findOne({ email });

    // --- DEBUGGING LOGS START ---
    console.log('User found in DB:', user ? user.email : 'No user found');
    // --- DEBUGGING LOGS END ---

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // 2. Check if password matches
    // --- DEBUGGING LOGS START ---
    console.log('Comparing passwords. User hashed password:', user.password);
    // --- DEBUGGING LOGS END ---
    const isMatch = await bcrypt.compare(password, user.password);

    // --- DEBUGGING LOGS START ---
    console.log('Password match result (isMatch):', isMatch);
    // --- DEBUGGING LOGS END ---

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // 3. Create the Access Token (JWT)
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '30d' }
    );

    // 4. Send back the user info and token
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: token,
    });

  } catch (error) {
    console.error("Auth Controller Catch Block Error:", error); // Specific message
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * Updates the authenticated user's profile information.
 * Allows updating name, email, and password.
 *
 * @function updateUserProfile
 * @param {Object} req - The Express request object.
 * @param {Object} req.user - The authenticated user attached by middleware.
 * @param {String} req.user._id - The user's ID.
 * @param {Object} req.body - The request body.
 * @param {String} [req.body.name] - The new name (optional).
 * @param {String} [req.body.email] - The new email (optional).
 * @param {String} [req.body.password] - The new password (optional).
 * @param {Object} res - The Express response object.
 * @returns {Promise<void>} Sends a JSON response with the updated user details.
 * @throws {Error} - Returns a 404 error if the user is not found.
 */
const updateUserProfile = asyncHandler(async (req, res) => { // Added asyncHandler
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      profilePicture: updatedUser.profilePicture, // Include profilePicture
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

/**
 * Uploads and updates the user's profile picture.
 * Uses the configured Multer upload middleware.
 *
 * @function updateProfilePicture
 * @param {Object} req - The Express request object.
 * @param {Object} req.user - The authenticated user attached by middleware.
 * @param {String} req.user._id - The user's ID.
 * @param {Object} req.file - The uploaded file object (from Multer).
 * @param {Object} res - The Express response object.
 * @returns {Promise<void>} Sends a JSON response with the new profile picture path.
 * @throws {Error} - Returns a 400 error for upload failures or no file, 404 if user not found.
 */
const updateProfilePicture = asyncHandler(async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      res.status(400);
      throw new Error(err); // Multer errors will be caught here
    }

    if (!req.file) {
      res.status(400);
      throw new Error('No file selected for upload.');
    }

    const user = await User.findById(req.user._id);

    if (user) {
      user.profilePicture = `/uploads/profile_pics/${req.file.filename}`; // Save relative path
      const updatedUser = await user.save();

      res.json({
        message: 'Profile picture updated!',
        profilePicture: updatedUser.profilePicture,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  });
});

module.exports = { 
  loginUser, 
  updateUserProfile,
  updateProfilePicture 
};
