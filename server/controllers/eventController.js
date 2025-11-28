const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');

/**
 * @module controllers/eventController
 * @description Controller for handling public event retrieval.
 */

/**
 * Retrieves a list of all publicly visible events (approved).
 * Sorts events by date in ascending order.
 *
 * @function getPublicEvents
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Promise<void>} Sends a JSON response with the list of approved events.
 * @throws {Error} - Throws an error if the database query fails (handled by asyncHandler).
 */
const getPublicEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ status: 'approved' })
    .sort({ date: 1 })
    .lean();

  res.json(events);
});

/**
 * Retrieves a single publicly visible event by its ID.
 * Populates organizer details.
 *
 * @function getPublicEventById
 * @param {Object} req - The Express request object.
 * @param {Object} req.params - The route parameters.
 * @param {String} req.params.id - The ID of the event to retrieve.
 * @param {Object} res - The Express response object.
 * @returns {Promise<void>} Sends a JSON response with the event details.
 * @throws {Error} - Returns a 404 error if the event is not found.
 */
const getPublicEventById = asyncHandler(async (req, res) => {
  const event = await Event.findOne({ _id: req.params.id, status: 'approved' })
    .populate('organizer', 'name email organizationName profilePicture')
    .lean();

  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }

  res.status(200).json(event);
});

module.exports = {
  getPublicEvents,
  getPublicEventById,
};
