const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

/**
 * Middleware to verify JSON Web Token (JWT) and attach the user to the request object.
 * Checks the 'Authorization' header for a Bearer token.
 *
 * @function protect
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function.
 * @throws {Error} - Throws a 401 'Not authorized' error if token is missing or invalid, or user is not found.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for the token in the 'Authorization' header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header: "Bearer TOKEN_STRING"
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token payload (excluding the password)
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      next(); // Move to the next middleware or controller
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

/**
 * Middleware to restrict access to Admin users only.
 * Must be used after the `protect` middleware.
 *
 * @function admin
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function.
 * @throws {Error} - Throws a 403 'Not authorized as an admin' error if the user role is not 'admin'.
 */
const admin = (req, res, next) => {
  // We rely on the protect middleware having already attached req.user
  if (req.user && req.user.role === 'admin') {
    next(); // User is an admin, proceed
  } else {
    res.status(403); // 403 Forbidden
    throw new Error('Not authorized as an admin');
  }
};

/**
 * Middleware to restrict access to Organizer users only.
 * Must be used after the `protect` middleware.
 *
 * @function organizer
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function.
 * @throws {Error} - Throws a 403 'Not authorized as an organizer' error if the user role is not 'organizer'.
 */
const organizer = (req, res, next) => {
  if (req.user && req.user.role === 'organizer') {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as an organizer');
  }
};

module.exports = { protect, admin, organizer };
