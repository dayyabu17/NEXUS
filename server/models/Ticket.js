const mongoose = require('mongoose');

/**
 * Ticket Schema
 *
 * @description Represents a ticket purchased or reserved by a user for an event.
 * @typedef {Object} Ticket
 * @property {mongoose.Schema.Types.ObjectId} user - Reference to the User who owns the ticket.
 * @property {mongoose.Schema.Types.ObjectId} event - Reference to the Event the ticket is for.
 * @property {number} quantity - Number of tickets (default 1).
 * @property {string} status - Status of the ticket ('pending', 'confirmed', 'checked-in').
 * @property {string} [paymentReference] - External payment gateway reference ID.
 * @property {number} amountPaid - Total amount paid for this ticket.
 * @property {Date} [checkedInAt] - Timestamp when the user checked in.
 * @property {string} [email] - Email address for ticket delivery.
 * @property {Object} metadata - Additional arbitrary data associated with the ticket.
 * @property {Date} createdAt - Timestamp of creation.
 * @property {Date} updatedAt - Timestamp of last update.
 */
const ticketSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'checked-in'],
      default: 'confirmed',
    },
    paymentReference: {
      type: String,
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    checkedInAt: {
      type: Date,
    },
    email: {
      type: String,
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

ticketSchema.index({ event: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Ticket', ticketSchema);
