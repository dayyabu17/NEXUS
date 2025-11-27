const mongoose = require('mongoose');

/**
 * Mongoose schema definition for the Ticket model.
 * Represents a ticket purchased by a user for an event.
 * @module models/Ticket
 */
const ticketSchema = new mongoose.Schema(
  {
    /**
     * The user ID of the ticket holder.
     * References the User model.
     * @type {mongoose.Schema.Types.ObjectId}
     * @required
     */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    /**
     * The event ID for which the ticket was purchased.
     * References the Event model.
     * @type {mongoose.Schema.Types.ObjectId}
     * @required
     */
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    /**
     * The number of tickets purchased in this transaction.
     * @type {Number}
     * @default 1
     * @min 1
     */
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    /**
     * The status of the ticket.
     * Can be 'pending' or 'confirmed'.
     * @type {String}
     * @default 'confirmed'
     */
    status: {
      type: String,
      enum: ['pending', 'confirmed'],
      default: 'confirmed',
    },
    /**
     * The reference ID associated with the payment for this ticket.
     * @type {String}
     */
    paymentReference: {
      type: String,
    },
    /**
     * The total amount paid for the ticket(s).
     * @type {Number}
     * @default 0
     */
    amountPaid: {
      type: Number,
      default: 0,
    },
    /**
     * The email address to which the ticket was sent or associated with.
     * @type {String}
     */
    email: {
      type: String,
    },
    /**
     * Additional metadata associated with the ticket purchase.
     * @type {Object}
     * @default {}
     */
    metadata: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Index to optimize queries for tickets by event and user.
ticketSchema.index({ event: 1, user: 1 });

/**
 * Ticket model based on the ticketSchema.
 * @type {mongoose.Model}
 */
module.exports = mongoose.model('Ticket', ticketSchema);
