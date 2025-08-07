const { body, validationResult } = require('express-validator');
const ResponseUtils = require('../utils/response');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.param,
      message: err.msg,
      value: err.value,
    }));
    return ResponseUtils.validationError(res, 'Validation failed', formattedErrors);
  }
  next();
};

const commonValidators = {
  email: (field = 'email') =>
    body(field)
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail()
      .isLength({ max: 255 })
      .withMessage('Email too long')
      .escape(),

  password: (field = 'password') =>
    body(field)
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 8, max: 128 })
      .withMessage('Password must be 8-128 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain uppercase, lowercase and number'),

  text: (field, options = {}) => {
    const { min = 1, max = 500, required = true, message = `${field} is required` } = options;
    let validator = body(field).trim();
    
    if (required) {
      validator = validator.notEmpty().withMessage(message);
    } else {
      validator = validator.optional();
    }
    
    return validator
      .isLength({ min: required ? min : 0, max })
      .withMessage(`${field} must be between ${min} and ${max} characters`)
      .escape();
  },

  uuid: (field) =>
    body(field)
      .trim()
      .notEmpty()
      .withMessage(`${field} is required`)
      .isUUID()
      .withMessage(`${field} must be a valid UUID`)
      .escape(),
};

module.exports = {
  commonValidators,
  handleValidationErrors,
};
