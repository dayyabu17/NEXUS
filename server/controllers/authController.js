const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const upload = require('../utils/fileUpload');
const asyncHandler = require('express-async-handler');

const DEFAULT_ACCENT = 'blue';
const DEFAULT_BRAND_COLOR = '#2563EB';

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
      organizationName: user.organizationName,
      profilePicture: user.profilePicture,
      accentPreference: user.accentPreference || DEFAULT_ACCENT,
      brandColor: user.brandColor || DEFAULT_BRAND_COLOR,
      avatarRingEnabled: Boolean(user.avatarRingEnabled),
      token,
    });

  } catch (error) {
    console.error("Auth Controller Catch Block Error:", error); // Specific message
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update user profile (name, email, password)
// @route   PUT /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('name email role organizationName profilePicture accentPreference brandColor avatarRingEnabled');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    organizationName: user.organizationName,
    profilePicture: user.profilePicture,
    accentPreference: user.accentPreference || DEFAULT_ACCENT,
    brandColor: user.brandColor || DEFAULT_BRAND_COLOR,
    avatarRingEnabled: Boolean(user.avatarRingEnabled),
  });
});

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
      organizationName: updatedUser.organizationName,
      profilePicture: updatedUser.profilePicture,
      accentPreference: updatedUser.accentPreference || DEFAULT_ACCENT,
      brandColor: updatedUser.brandColor || DEFAULT_BRAND_COLOR,
      avatarRingEnabled: Boolean(updatedUser.avatarRingEnabled),
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
      const message = typeof err === 'string' ? err : err?.message || 'Unable to upload image.';
      return res.status(400).json({ message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file selected for upload.' });
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
      return res.status(404).json({ message: 'User not found' });
    }
  });
});

module.exports = { 
  loginUser, 
  getUserProfile,
  updateUserProfile,
  updateProfilePicture 
};