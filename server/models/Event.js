const mongoose = require('mongoose');

/**
 * Mongoose schema definition for the Event model.
 * Represents an event created by an organizer.
 * @module models/Event
 */
const eventSchema = new mongoose.Schema(
  {
    /**
     * The title of the event.
     * @type {String}
     * @required
     */
    title: {
      type: String,
      required: true,
    },
    /**
     * A detailed description of the event.
     * @type {String}
     * @required
     */
    description: {
      type: String,
      required: true,
    },
    /**
     * The date and time when the event starts.
     * @type {Date}
     * @required
     */
    date: {
      type: Date,
      required: true,
    },
    /**
     * The physical location or address of the event.
     * @type {String}
     * @required
     */
    location: {
      type: String,
      required: true,
    },
    /**
     * The latitude coordinate of the event location.
     * @type {Number}
     */
    locationLatitude: {
      type: Number,
    },
    /**
     * The longitude coordinate of the event location.
     * @type {Number}
     */
    locationLongitude: {
      type: Number,
    },
    /**
     * The user ID of the organizer who created the event.
     * References the User model.
     * @type {mongoose.Schema.Types.ObjectId}
     * @required
     */
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    /**
     * The approval status of the event.
     * Can be 'pending', 'approved', or 'rejected'.
     * @type {String}
     * @default 'pending'
     */
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    /**
     * The category of the event.
     * @type {String}
     * @required
     */
    category: {
      type: String,
      enum: ['Technology', 'Academic', 'Social', 'Sports', 'Music', 'Business', 'Arts', 'Health', 'Religious', 'Culture', 'Others'],
      required: true,
    },
    /**
     * The maximum number of attendees allowed.
     * @type {Number}
     */
    capacity: {
      type: Number,
    },
    /**
     * The number of tickets sold so far.
     * @type {Number}
     * @default 0
     */
    ticketsSold: {
      type: Number,
      default: 0,
    },
    /**
     * The registration fee for the event (deprecated, use price).
     * @type {Number}
     * @default 0
     */
    registrationFee: {
      type: Number,
      default: 0,
    },
    /**
     * The price of a ticket for the event.
     * @type {Number}
     * @default 0
     * @required
     */
    price: {
      type: Number,
      default: 0,
      required: true,
    },
    /**
     * A list of tags associated with the event.
     * @type {String[]}
     * @default []
     */
    tags: {
      type: [String],
      default: [],
    },
    /**
     * The number of people who have RSVP'd (deprecated/unused in favor of ticketsSold).
     * @type {Number}
     * @default 0
     */
    rsvpCount: {
      type: Number,
      default: 0,
    },
    /**
     * The URL to the event's promotional image.
     * @type {String}
     */
    imageUrl: {
      type: String,
    },
    /**
     * The timezone of the event location.
     * @type {String}
     */
    timezone: {
      type: String,
    },
    /**
     * The date when the event ends.
     * @type {Date}
     */
    endDate: {
      type: Date,
    },
    /**
     * The time when the event ends (string format).
     * @type {String}
     */
    endTime: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Event model based on the eventSchema.
 * @type {mongoose.Model}
 */
module.exports = mongoose.model('Event', eventSchema);
