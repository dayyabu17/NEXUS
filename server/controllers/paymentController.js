const axios = require('axios');
const Ticket = require('../models/Ticket');
const Event = require('../models/Event');

const PAYSTACK_BASE_URL = 'https://api.paystack.co';
const FRONTEND_FALLBACK = 'http://localhost:5173';
const paymentDebugEnabled = process.env.PAYMENT_DEBUG === 'true';
const debugPayment = (...args) => {
  if (paymentDebugEnabled) {
    console.log(...args);
  }
};

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

const initializeRSVP = async (req, res) => {
  try {
    const { userId, eventId, quantity = 1, email } = req.body;
    if (!userId || !eventId || !email) {
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    const qty = Math.max(1, parseInt(quantity, 10));
    const event = await Event.findById(eventId);
    debugPayment('DEBUG PAYMENT:', {
      title: event?.title,
      dbPrice: event?.price,
      dbFee: event?.registrationFee,
    });

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
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

    const ticketQty = Math.max(1, Number(quantity) || 1);

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
