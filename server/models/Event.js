const mongoose = require('mongoose');

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