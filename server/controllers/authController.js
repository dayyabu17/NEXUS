const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const upload = require('../utils/fileUpload');
const asyncHandler = require('express-async-handler')

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
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

// @desc    Update user profile (name, email, password)
// @route   PUT /api/auth/profile
// @access  Private
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

// @desc    Upload user profile picture
// @route   PUT /api/auth/profile/picture
// @access  Private
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