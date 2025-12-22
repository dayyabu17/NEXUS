const mongoose = require('mongoose');

/**
 * User Schema
 *
 * @description Represents a user in the system (Student, Organizer, or Admin).
 * @typedef {Object} User
 * @property {string} name - The full name of the user.
 * @property {string} email - The unique email address of the user.
 * @property {string} password - The hashed password.
 * @property {string} role - The user's role ('student', 'organizer', 'admin').
 * @property {string} [organizationName] - Name of the organization (required for 'organizer' role).
 * @property {Date} createdAt - Timestamp of account creation.
 * @property {string} profilePicture - URL to the user's profile picture.
 * @property {string[]} notificationReads - List of read notification IDs.
 * @property {string} accentPreference - UI accent color preference.
 * @property {string} brandColor - Custom brand color (hex code).
 * @property {boolean} avatarRingEnabled - Whether the avatar ring is enabled.
 * @property {string[]} interests - List of user interests (e.g., 'Technology', 'Music').
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['student', 'organizer', 'admin'], // <--- This is crucial for your Admin side
    default: 'student',
  },
  organizationName: {
    type: String, // Only required if role is 'organizer'
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  profilePicture: { type: String, default: '/images/default-avatar.jpeg' },
  notificationReads: {
    type: [String],
    default: [],
  },
  accentPreference: {
    type: String,
    enum: ['blue', 'purple', 'green', 'orange'],
    default: 'blue',
  },
  brandColor: {
    type: String,
    default: '#2563EB',
  },
  avatarRingEnabled: {
    type: Boolean,
    default: false,
  },
  interests: {
    type: [String],
    default: [],
  },
});

module.exports = mongoose.model('User', userSchema);