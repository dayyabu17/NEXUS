const mongoose = require('mongoose');

/**
 * Mongoose schema definition for the User model.
 * @module models/User
 */
const userSchema = new mongoose.Schema({
  /**
   * The full name of the user.
   * @type {String}
   * @required
   */
  name: {
    type: String,
    required: true,
  },
  /**
   * The unique email address of the user.
   * @type {String}
   * @required
   * @unique
   */
  email: {
    type: String,
    required: true,
    unique: true,
  },
  /**
   * The hashed password of the user.
   * @type {String}
   * @required
   */
  password: {
    type: String,
    required: true,
  },
  /**
   * The role of the user within the system.
   * Can be 'student', 'organizer', or 'admin'.
   * @type {String}
   * @default 'student'
   */
  role: {
    type: String,
    enum: ['student', 'organizer', 'admin'],
    default: 'student',
  },
  /**
   * The name of the organization (only if role is 'organizer').
   * @type {String}
   */
  organizationName: {
    type: String,
  },
  /**
   * The date and time when the user account was created.
   * @type {Date}
   * @default Date.now
   */
  createdAt: {
    type: Date,
    default: Date.now,
  },
  /**
   * The URL or path to the user's profile picture.
   * @type {String}
   * @default '/images/default-avatar.jpeg'
   */
  profilePicture: { type: String, default: '/images/default-avatar.jpeg' },
  /**
   * A list of IDs representing notifications that have been read by the user.
   * @type {String[]}
   * @default []
   */
  notificationReads: {
    type: [String],
    default: [],
  },
});

/**
 * User model based on the userSchema.
 * @type {mongoose.Model}
 */
module.exports = mongoose.model('User', userSchema);
