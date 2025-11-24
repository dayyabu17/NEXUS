const mongoose = require('mongoose');

/**
 * Mongoose schema for Event.
 * Represents an event created by an organizer.
 *
 * @typedef {Object} Event
 * @property {string} title - The title of the event.
 * @property {string} description - A detailed description of the event.
 * @property {Date} date - The date and time when the event takes place.
 * @property {string} location - The physical location of the event.
 * @property {mongoose.Schema.Types.ObjectId} organizer - Reference to the User who organized the event.
 * @property {string} status - The approval status of the event. Can be 'pending', 'approved', or 'rejected'. Defaults to 'pending'.
 * @property {string} [imageUrl] - URL to an image associated with the event.
 * @property {Date} createdAt - The date and time when the event was created. Defaults to current time.
 */
const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Links this event to the User who created it
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'], // <--- Admin controls this
    default: 'pending',
  },
  imageUrl: {
    type: String, // URL to the event image
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/**
 * Event model based on the eventSchema.
 * @type {mongoose.Model<Event>}
 */
module.exports = mongoose.model('Event', eventSchema);
