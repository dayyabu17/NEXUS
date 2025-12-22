const mongoose = require('mongoose');

/**
 * Event Schema
 *
 * @description Represents an event in the system, including details, location, status, and tickets.
 * @typedef {Object} Event
 * @property {string} title - The title of the event.
 * @property {string} description - The description of the event.
 * @property {Date} date - The start date and time of the event.
 * @property {string} location - The textual location address or name.
 * @property {number} [locationLatitude] - The latitude coordinate of the location.
 * @property {number} [locationLongitude] - The longitude coordinate of the location.
 * @property {mongoose.Schema.Types.ObjectId} organizer - Reference to the User who is the organizer.
 * @property {string} status - The approval status ('pending', 'approved', 'rejected').
 * @property {boolean} isFeatured - Whether the event is featured on the dashboard.
 * @property {string} category - The category of the event (e.g., 'Technology', 'Sports').
 * @property {number} [capacity] - The maximum number of attendees.
 * @property {number} ticketsSold - The number of tickets already sold.
 * @property {number} registrationFee - Fee for registering (legacy/alternate price field).
 * @property {number} price - The price of a ticket (0 for free events).
 * @property {string[]} tags - List of tags associated with the event.
 * @property {number} rsvpCount - Counter for RSVPs/interest (distinct from confirmed tickets).
 * @property {string} [imageUrl] - URL to the event's cover image.
 * @property {string} [timezone] - Timezone of the event location.
 * @property {Date} [endDate] - The end date and time of the event.
 * @property {string} [endTime] - The specific end time string.
 * @property {Date} createdAt - Timestamp of creation.
 * @property {Date} updatedAt - Timestamp of last update.
 */
const eventSchema = new mongoose.Schema(
  {
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
    locationLatitude: {
      type: Number,
    },
    locationLongitude: {
      type: Number,
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
    isFeatured: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      enum: ['Technology', 'Academic', 'Social', 'Sports', 'Music', 'Business', 'Arts', 'Health', 'Religious', 'Culture', 'Others'],
      required: true,
    },
    capacity: {
      type: Number,
    },
    ticketsSold: {
      type: Number,
      default: 0,
    },
    registrationFee: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      default: 0,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    rsvpCount: {
      type: Number,
      default: 0,
    },
    imageUrl: {
      type: String, // URL to the event image
    },
    timezone: {
      type: String,
    },
    endDate: {
      type: Date,
    },
    endTime: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Event', eventSchema);