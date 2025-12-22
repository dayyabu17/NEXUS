const express = require('express');
const { initializeRSVP, verifyPayment } = require('../controllers/paymentController');

const router = express.Router();

/**
 * @route POST /api/payment/rsvp/initialize
 * @desc Initialize payment or confirm free ticket.
 * @access Private
 */
router.post('/rsvp/initialize', initializeRSVP);

/**
 * @route GET /api/payment/rsvp/verify
 * @desc Verify Paystack payment transaction.
 * @access Public
 */
router.get('/rsvp/verify', verifyPayment);

module.exports = router;
