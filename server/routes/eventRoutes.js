const express = require('express');
const { getPublicEvents, getPublicEventById } = require('../controllers/eventController');

const router = express.Router();

/**
 * @module routes/eventRoutes
 * @description API routes for public event access.
 */

/**
 * @route GET /api/events
 * @description Get all approved, publicly visible events.
 * @access Public
 */
router.get('/', getPublicEvents);

/**
 * @route GET /api/events/:id
 * @description Get details of a single public event.
 * @access Public
 */
router.get('/:id', getPublicEventById);

module.exports = router;
