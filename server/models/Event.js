const mongoose = require('mongoose');

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

module.exports = mongoose.model('Event', eventSchema);