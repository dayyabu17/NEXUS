const axios = require('axios');
const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const User = require('../models/User');
const { sendNotificationEmail } = require('../utils/emailService');

const PAYSTACK_BASE_URL = 'https://api.paystack.co';
const FRONTEND_FALLBACK = 'http://localhost:5173';
const paymentDebugEnabled = process.env.PAYMENT_DEBUG === 'true';
const debugPayment = (...args) => {
  if (paymentDebugEnabled) {
    console.log(...args);
  }
};

const buildFreeTicketEmail = ({
  attendeeName,
  eventTitle,
  ticketId,
}) => `
  <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background-color: #0f172a; color: #e2e8f0; border-radius: 16px;">
    <h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 600; color: #60a5fa;">Ticket Confirmed</h1>
    <p style="margin: 0 0 12px;">Hi ${attendeeName || 'there'},</p>
    <p style="margin: 0 0 16px;">You're all set for <strong>${eventTitle}</strong>.</p>
    <div style="margin: 0 0 20px; padding: 12px 16px; border-radius: 12px; background-color: #1e293b;">
      <p style="margin: 0; color: #93c5fd;">Ticket ID</p>
      <p style="margin: 4px 0 0; font-size: 18px; font-weight: 600; color: #f8fafc;">${ticketId}</p>
    </div>
    <p style="margin: 0 0 16px;">We'll send reminders as the event approaches. Keep this email handy for check-in.</p>
    <p style="margin: 0; color: #94a3b8;">— Nexus Events</p>
  </div>
`;

const buildPaidTicketEmail = ({
  attendeeName,
  eventTitle,
  ticketId,
  amountPaid,
}) => `
  <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background-color: #0f172a; color: #e2e8f0; border-radius: 16px;">
    <h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 600; color: #34d399;">Payment Receipt</h1>
    <p style="margin: 0 0 12px;">Hello ${attendeeName || 'there'},</p>
    <p style="margin: 0 0 16px;">Thanks for securing your spot at <strong>${eventTitle}</strong>.</p>
    <div style="margin: 0 0 20px; padding: 12px 16px; border-radius: 12px; background-color: #064e3b;">
      <p style="margin: 0; color: #6ee7b7;">Amount Paid</p>
      <p style="margin: 4px 0 12px; font-size: 18px; font-weight: 600; color: #f0fdf4;">₦${amountPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      <p style="margin: 0; color: #6ee7b7;">Ticket ID</p>
      <p style="margin: 4px 0 0; font-size: 16px; font-weight: 600; color: #f0fdf4;">${ticketId}</p>
    </div>
    <p style="margin: 0 0 16px;">We look forward to seeing you. Save this email for event day.</p>
    <p style="margin: 0; color: #94a3b8;">— Nexus Events</p>
  </div>
`;

const getSafeNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const updateEventSales = async (event, quantity) => {
  const increment = getSafeNumber(quantity, 1);
  const currentSold = getSafeNumber(event.ticketsSold, getSafeNumber(event.rsvpCount, 0));
  event.ticketsSold = currentSold + increment;
  event.rsvpCount = getSafeNumber(event.rsvpCount, 0) + increment;
  await event.save();
};

/**
 * Initialize event RSVP/Payment.
 *
 * @description Handles the ticket reservation process. If the event is free, it confirms the ticket directly.
 * If paid, it initializes a Paystack transaction.
 * @route POST /api/payment/initialize
 * @access Private
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {void}
 */
const initializeRSVP = async (req, res) => {
  try {
    const { userId, eventId, email } = req.body;
    if (!userId || !eventId || !email) {
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    const qty = 1;
    const event = await Event.findById(eventId);
    debugPayment('DEBUG PAYMENT:', {
      title: event?.title,
      dbPrice: event?.price,
      dbFee: event?.registrationFee,
    });

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const existingTicket = await Ticket.findOne({
      user: userId,
      event: eventId,
      status: 'confirmed',
    });

    if (existingTicket) {
      return res.status(409).json({
        success: false,
        message: 'You already have a ticket for this event.',
        ticketId: existingTicket._id,
      });
    }

    const costPerTicket = getSafeNumber(event.price, 0) || getSafeNumber(event.registrationFee, 0);
    const unitPrice = costPerTicket;

    const capacity = getSafeNumber(event.capacity, 0);
    const currentSold = getSafeNumber(event.ticketsSold, getSafeNumber(event.rsvpCount, 0));

    if (capacity > 0 && currentSold + qty > capacity) {
      return res.status(400).json({ success: false, message: 'Event is fully booked.' });
    }

    if (unitPrice === 0) {
      const ticket = await Ticket.create({
        user: userId,
        event: eventId,
        quantity: qty,
        status: 'confirmed',
        paymentReference: `FREE-${Date.now()}`,
        email,
        amountPaid: 0,
        metadata: { userId, eventId, quantity: qty },
      });

      await updateEventSales(event, qty);

      try {
        const user = await User.findById(userId).select('name email');
        const attendeeName = user?.name;
        const recipientEmail = user?.email || email;

        if (recipientEmail) {
          const htmlContent = buildFreeTicketEmail({
            attendeeName,
            eventTitle: event.title,
            ticketId: ticket._id,
          });

          sendNotificationEmail(
            recipientEmail,
            `Ticket Confirmed: ${event.title}`,
            htmlContent,
          ).catch((error) => console.error('Free ticket email failed:', error));
        }
      } catch (notificationError) {
        console.error('Unable to send free ticket confirmation email:', notificationError);
      }

      return res.json({ success: true, isFree: true, ticketId: ticket._id });
    }

    const totalAmountKobo = Math.round(unitPrice * qty * 100);

    if (!process.env.PAYSTACK_SECRET_KEY) {
      return res.status(500).json({ success: false, message: 'Payment gateway is not configured.' });
    }

    const frontendBase = process.env.FRONTEND_BASE_URL || FRONTEND_FALLBACK;
    const normalizedBase = frontendBase.endsWith('/') ? frontendBase.slice(0, -1) : frontendBase;
    const callbackUrl = `${normalizedBase}/payment/callback`;

    const paystackResponse = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        email,
        amount: totalAmountKobo,
        callback_url: callbackUrl,
        metadata: {
          userId,
          eventId,
          quantity: qty,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const payload = paystackResponse?.data;
    if (!payload?.status || !payload?.data) {
      return res.status(502).json({ success: false, message: 'Unable to initialize payment.' });
    }

    const { authorization_url: authorizationUrl, reference } = payload.data;

    return res.json({
      success: true,
      isFree: false,
      authorization_url: authorizationUrl,
      reference,
    });
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Unable to initialize RSVP.';
    console.error('initializeRSVP error:', message);
    return res.status(500).json({ success: false, message });
  }
};

/**
 * Verify Paystack payment.
 *
 * @description Verifies a payment transaction with Paystack using the reference.
 * If successful, creates a confirmed ticket and sends a receipt email.
 * @route GET /api/payment/verify
 * @access Public (called by frontend after payment redirect)
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {void}
 */
const verifyPayment = async (req, res) => {
  const { reference } = req.query;

  if (!reference) {
    return res.status(400).json({ success: false, message: 'Reference is required.' });
  }

  if (!process.env.PAYSTACK_SECRET_KEY) {
    return res.status(500).json({ success: false, message: 'Payment gateway is not configured.' });
  }

  try {
    debugPayment('--- START VERIFICATION ---');
    debugPayment('Ref:', reference);

    const response = await axios.get(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    });

    const data = response.data?.data;
    if (!data || data.status !== 'success') {
      return res.status(400).json({ success: false, message: 'Paystack says transaction failed' });
    }

    const metadata = data.metadata || {};
    const { eventId, userId } = metadata;
    const quantity = metadata.quantity ?? metadata.qty ?? 1;
    debugPayment('Metadata:', { eventId, userId, quantity });

    if (!eventId || !userId) {
      return res.status(400).json({ success: false, message: 'Payment metadata is incomplete.' });
    }

    const existingTicket = await Ticket.findOne({ paymentReference: reference });
    if (existingTicket) {
      debugPayment('Ticket already exists for reference, returning existing id');
      return res.status(200).json({ success: true, ticketId: existingTicket._id });
    }

    const ticketQty = 1;

    const existingConfirmedTicket = await Ticket.findOne({
      event: eventId,
      user: userId,
      status: 'confirmed',
    });

    if (existingConfirmedTicket) {
      debugPayment('User already owns ticket for event, skipping creation.');
      return res.status(200).json({
        success: true,
        ticketId: existingConfirmedTicket._id,
        alreadyRegistered: true,
      });
    }

    try {
      const newTicket = await Ticket.create({
        event: eventId,
        user: userId,
        quantity: ticketQty,
        paymentReference: reference,
        status: 'confirmed',
        amountPaid: getSafeNumber(data.amount, 0) / 100,
        email: data.customer?.email,
        metadata,
      });
      debugPayment('Ticket Created Successfully:', newTicket._id);

      const updateResult = await Event.findByIdAndUpdate(
        eventId,
        { $inc: { ticketsSold: ticketQty, rsvpCount: ticketQty } },
        { new: true }
      );

      if (!updateResult) {
        debugPayment('Event not found while updating counters for eventId:', eventId);
      }

      try {
        const [user, event] = await Promise.all([
          User.findById(userId).select('name email'),
          Event.findById(eventId).select('title'),
        ]);

        const attendeeName = user?.name;
        const recipientEmail = user?.email;

        if (recipientEmail) {
          const amountPaid = getSafeNumber(data.amount, 0) / 100;
          const htmlContent = buildPaidTicketEmail({
            attendeeName,
            eventTitle: event?.title || 'Your Event',
            ticketId: newTicket._id,
            amountPaid,
          });

          sendNotificationEmail(
            recipientEmail,
            `Payment Receipt: ${event?.title || 'Event Ticket'}`,
            htmlContent,
          ).catch((error) => console.error('Paid ticket email failed:', error));
        }
      } catch (notificationError) {
        console.error('Unable to send paid ticket receipt email:', notificationError);
      }

      return res.status(200).json({ success: true, ticketId: newTicket._id });
    } catch (creationError) {
      console.error('Ticket Creation Failed:', creationError.message);

      if (creationError.message.includes('duplicate')) {
        const existing = await Ticket.findOne({ paymentReference: reference });
        return res.status(200).json({ success: true, ticketId: existing?._id });
      }

      return res.status(500).json({ success: false, message: `Ticket Creation Failed: ${creationError.message}` });
    }
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Unable to verify payment.';
    console.error('verifyPayment error:', message);
    return res.status(500).json({ success: false, message });
  }
};

module.exports = {
  initializeRSVP,
  verifyPayment,
};
