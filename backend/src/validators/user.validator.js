const { body } = require('express-validator');
const { handleValidationErrors } = require('./common.validator');

const userValidators = {
  updateProfile: [
    body('displayName')
      .optional()
      .trim()
      .escape()
      .isLength({ min: 2, max: 50 })
      .withMessage('Display name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z0-9\s\u00C0-\u1EF9_-]+$/)
      .withMessage('Display name contains invalid characters'),

    body('removeAvatar')
      .optional()
      .isBoolean()
      .withMessage('removeAvatar must be a boolean'),

    body('dailyGoal')
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage('Daily goal must be between 1 and 1000'),

    handleValidationErrors,
  ],

  reportContent: [
    body('wordId')
      .trim()
      .notEmpty()
      .withMessage('Word ID is required')
      .isUUID()
      .withMessage('Invalid word ID format'),

    body('reason')
      .trim()
      .escape()
      .notEmpty()
      .withMessage('Report reason is required')
      .isLength({ min: 10, max: 500 })
      .withMessage('Reason must be between 10 and 500 characters'),

    handleValidationErrors,
  ],
};

module.exports = userValidators;
