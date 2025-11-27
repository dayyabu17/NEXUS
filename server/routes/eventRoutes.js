const express = require('express');
const { getPublicEvents, getPublicEventById } = require('../controllers/eventController');

const router = express.Router();

router.get('/', getPublicEvents);
router.get('/:id', getPublicEventById);

module.exports = router;
