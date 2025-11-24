const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const upload = require('../utils/fileUpload');
const asyncHandler = require('express-async-handler')

/**
 * Authenticates a user and returns a JWT token.
 *
 * @function loginUser
 * @param {import('express').Request} req - The Express request object containing email and password in body.
 * @param {import('express').Response} res - The Express response object.
 * @returns {void} Sends a JSON response with user info and token, or an error.
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
 * Updates the user's profile (name, email, password).
 *
 * @function updateUserProfile
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {void} Sends a JSON response with updated user info.
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
 * Uses the `upload` utility middleware for handling the file upload.
 *
 * @function updateProfilePicture
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {void} Sends a JSON response with the new profile picture URL.
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
