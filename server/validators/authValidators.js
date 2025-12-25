const { body, validationResult } = require('express-validator');

const handleValidationResult = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(({ msg, param }) => ({ message: msg, field: param })),
    });
  }

  return next();
};

const validateLogin = [
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').isString().notEmpty().withMessage('Password is required'),
  handleValidationResult,
];

const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .isIn(['student', 'organizer'])
    .withMessage('Invalid role selection'),
  body('organization')
    .if(body('role').equals('organizer'))
    .trim()
    .notEmpty()
    .withMessage('Organization is required for organizers'),
  handleValidationResult,
];

module.exports = {
  validateLogin,
  validateRegister,
};
