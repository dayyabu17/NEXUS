const mongoose = require('mongoose');

/**
 * Mongoose schema for User.
 * Represents a user in the system, which can be a student, organizer, or admin.
 *
 * @typedef {Object} User
 * @property {string} name - The full name of the user.
 * @property {string} email - The email address of the user (unique).
 * @property {string} password - The hashed password of the user.
 * @property {string} role - The role of the user. Can be 'student', 'organizer', or 'admin'. Defaults to 'student'.
 * @property {string} [organizationName] - The name of the organization. Only relevant if role is 'organizer'.
 * @property {Date} createdAt - The date and time when the user was created. Defaults to current time.
 * @property {string} [profilePicture] - URL to the user's profile picture. Defaults to a default avatar.
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
});

/**
 * User model based on the userSchema.
 * @type {mongoose.Model<User>}
 */
module.exports = mongoose.model('User', userSchema);
