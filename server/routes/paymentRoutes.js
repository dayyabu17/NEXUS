const express = require('express');
const { initializeRSVP, verifyPayment } = require('../controllers/paymentController');

const router = express.Router();

router.post('/rsvp/initialize', initializeRSVP);
router.get('/rsvp/verify', verifyPayment);

module.exports = router;
