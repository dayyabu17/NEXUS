const mongoose = require('mongoose');

/**
 * Feedback Schema
 *
 * @description Represents user feedback or reviews for a specific event.
 * @typedef {Object} Feedback
 * @property {mongoose.Schema.Types.ObjectId} event - Reference to the Event being reviewed.
 * @property {mongoose.Schema.Types.ObjectId} user - Reference to the User submitting the feedback.
 * @property {string} message - The content of the feedback (5-1000 characters).
 * @property {number} [rating] - Numeric rating from 1 to 5.
 * @property {Date} createdAt - Timestamp of creation.
 * @property {Date} updatedAt - Timestamp of last update.
 */
const feedbackSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 1000,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

feedbackSchema.index({ event: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
