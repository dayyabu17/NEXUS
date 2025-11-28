const express = require('express');
const { initializeRSVP, verifyPayment } = require('../controllers/paymentController');

const router = express.Router();

/**
 * @module routes/paymentRoutes
 * @description API routes for payment processing.
 */

/**
 * @route POST /api/payment/rsvp/initialize
 * @description Initialize a payment or RSVP transaction.
 * @access Public (or Protected depending on requirements)
 */
router.post('/rsvp/initialize', initializeRSVP);

/**
 * @route GET /api/payment/rsvp/verify
 * @description Verify a payment transaction.
 * @access Public
 */
router.get('/rsvp/verify', verifyPayment);

module.exports = router;
