const { body } = require('express-validator');
const { commonValidators, handleValidationErrors } = require('./common.validator');

const teacherValidators = {
  submitVerification: [
    body('fullName')
      .trim()
      .notEmpty()
      .withMessage('Full name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Full name must be between 2 and 100 characters')
      .matches(/^[a-zA-Z\s\u00C0-\u1EF9]+$/)
      .withMessage('Full name can only contain letters and spaces'),

    body('institution')
      .trim()
      .notEmpty()
      .withMessage('School/Institution name is required')
      .isLength({ min: 2, max: 200 })
      .withMessage('Institution name must be between 2 and 200 characters'),

    commonValidators.email('schoolEmail'),

    body('additionalNotes')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Additional notes must not exceed 1000 characters'),

    handleValidationErrors,
  ],
};

module.exports = teacherValidators;
