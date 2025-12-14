const mongoose = require('mongoose');

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
