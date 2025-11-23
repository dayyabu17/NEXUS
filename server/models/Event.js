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
    },
    capacity: {
      type: Number,
    },
    registrationFee: {
      type: Number,
      default: 0,
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Event', eventSchema);