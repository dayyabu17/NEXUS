// No changes to apply
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

/**
 * Middleware to verify JWT and attach the user to the request.
 *
 * @description Checks for a Bearer token in the 'Authorization' header.
 * Verifies the token and retrieves the user details (excluding password).
 * If valid, attaches the user to `req.user`.
 *
 * @function protect
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @throws {Error} Throws an error if the token is missing, invalid, or the user is not found.
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
 *
 * @description Requires the `protect` middleware to run first to populate `req.user`.
 * Checks if `req.user.role` is 'admin'.
 *
 * @function admin
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @throws {Error} Throws an error if the user is not an admin.
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
 *
 * @description Requires the `protect` middleware to run first to populate `req.user`.
 * Checks if `req.user.role` is 'organizer'.
 *
 * @function organizer
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @throws {Error} Throws an error if the user is not an organizer.
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