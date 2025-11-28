const express = require('express');
const { getPublicEvents, getPublicEventById, getDashboardData } = require('../controllers/eventController');

const router = express.Router();

router.get('/dashboard', getDashboardData);
router.get('/', getPublicEvents);
router.get('/:id', getPublicEventById);

module.exports = router;
