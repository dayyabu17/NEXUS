const express = require('express');
const { protect, organizer } = require('../middleware/authMiddleware');
const {
  fetchPaystackBanks,
  resolveBankAccount,
  createOrUpdatePayoutAccount,
} = require('../controllers/payoutController');

const router = express.Router();

router.get('/paystack/banks', protect, organizer, fetchPaystackBanks);
router.post('/paystack/resolve-account', protect, organizer, resolveBankAccount);
router.post('/payouts/create', protect, organizer, createOrUpdatePayoutAccount);

module.exports = router;
