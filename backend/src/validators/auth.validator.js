const { body, validationResult } = require('express-validator');

const authValidator = {
  register: [
    body('email')
      .trim()
      .notEmpty()
      .isEmail()
      .normalizeEmail()
      .withMessage('Invalid email format'),
    body('password')
      .isLength({ min: 8, max: 128 })
      .withMessage('Password must be 8-128 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain uppercase, lowercase and number'),
    body('role')
      .optional()
      .trim()
      .isIn(['learner', 'teacher'])
      .withMessage('Role must be learner or teacher'),
  ],

  login: [
    body('email')
      .trim()
      .notEmpty()
      .isEmail()
      .normalizeEmail()
      .withMessage('Invalid email format'),
    body('password').notEmpty().withMessage('Password must not be empty'),
  ],

  email: [
    body('email')
      .trim()
      .notEmpty()
      .isEmail()
      .normalizeEmail()
      .withMessage('Invalid email format'),
  ],
};

module.exports = authValidator;
