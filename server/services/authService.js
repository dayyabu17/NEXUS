const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { DEFAULT_ACCENT, DEFAULT_BRAND_COLOR } = require('../config/themeDefaults');

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const buildUserPayload = (user) => ({
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

const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw createHttpError(500, 'JWT secret is not configured');
  }

  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const authenticateUser = async ({ email, password }) => {
  const normalizedEmail = (email || '').trim().toLowerCase();

  if (!normalizedEmail || !password) {
    throw createHttpError(400, 'Email and password are required');
  }

  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    throw createHttpError(400, 'Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw createHttpError(400, 'Invalid email or password');
  }

  const token = generateToken(user);
  const profile = buildUserPayload(user);

  return { profile, token };
};

const registerUser = async ({ name, email, password, role, organization }) => {
  if (!name || !email || !password || !role) {
    throw createHttpError(400, 'Missing required registration fields');
  }

  if (!['student', 'organizer'].includes(role)) {
    throw createHttpError(400, 'Invalid role selection');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    throw createHttpError(400, 'User already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const payload = {
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role,
  };

  if (role === 'organizer' && organization) {
    payload.organizationName = organization.trim();
  }

  await User.create(payload);
};

const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select(
    'name email role organizationName profilePicture accentPreference brandColor avatarRingEnabled'
  );

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  return buildUserPayload(user);
};

const updateUserProfile = async (userId, { name, email, password }) => {
  const user = await User.findById(userId);

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  if (name) {
    user.name = name;
  }

  if (email) {
    user.email = email;
  }

  if (password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
  }

  const updatedUser = await user.save();

  return buildUserPayload(updatedUser);
};

const updateProfilePicture = async (userId, relativePath) => {
  if (!relativePath) {
    throw createHttpError(400, 'Profile picture path is required');
  }

  const user = await User.findById(userId);

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  user.profilePicture = relativePath;
  const updatedUser = await user.save();

  return {
    message: 'Profile picture updated!',
    profilePicture: updatedUser.profilePicture,
  };
};

module.exports = {
  authenticateUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  updateProfilePicture,
  buildUserPayload,
};
