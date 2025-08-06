const { body, param } = require('express-validator');
const { handleValidationErrors } = require('./common.validator');

const adminValidator = {
  getRequestById: [
    param('requestId')
      .isUUID()
      .withMessage('URL parameter requestId must be a valid UUID.'),
    handleValidationErrors,
  ],

  rejectTeacherRequest: [
    param('requestId')
      .isUUID()
      .withMessage('URL parameter requestId must be a valid UUID.'),
    body('reason')
      .trim()
      .notEmpty()
      .withMessage('A reason is required to reject a request.')
      .isLength({ min: 1, max: 1000 })
      .withMessage('Reason must be between 1 and 1000 characters.'),
    handleValidationErrors,
  ],

  getReportById: [
    param('reportId')
      .isUUID()
      .withMessage('URL parameter reportId must be a valid UUID.'),
    handleValidationErrors,
  ],

  resolveReport: [
    param('reportId')
      .isUUID()
      .withMessage('URL parameter reportId must be a valid UUID.'),
    body('notes')
      .trim()
      .notEmpty()
      .withMessage('Admin notes are required to resolve a report.')
      .isLength({ min: 1, max: 2000 })
      .withMessage('Notes must be between 1 and 2000 characters.'),
    handleValidationErrors,
  ],
};

module.exports = adminValidator;