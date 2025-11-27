const express = require('express');
const { getMyTickets, purgeTickets } = require('../controllers/ticketController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/my-tickets', protect, getMyTickets);
router.get('/purge', purgeTickets);

module.exports = router;
