const { body } = require('express-validator');
const { handleValidationErrors } = require('./common.validator');

const userValidators = {
  reportContent: [
    body('wordId')
      .trim()
      .notEmpty()
      .withMessage('Word ID is required')
      .isUUID()
      .withMessage('Invalid word ID format'),

    body('reason')
      .trim()
      .notEmpty()
      .withMessage('Report reason is required')
      .isLength({ min: 10, max: 500 })
      .withMessage('Reason must be between 10 and 500 characters'),

    handleValidationErrors,
  ],
};

module.exports = userValidators;
