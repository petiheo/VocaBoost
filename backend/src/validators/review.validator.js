const { body, param } = require('express-validator');
const { handleValidationErrors } = require('./common.validator');

const reviewValidator = {
  startSession: [
    body('listId')
      .trim()
      .notEmpty()
      .withMessage('listId is required.')
      .isUUID()
      .withMessage('listId must be a valid UUID.'),

    body('sessionType')
      .trim()
      .notEmpty()
      .withMessage('sessionType is required.')
      .isIn(['flashcard', 'fill_blank', 'word_association'])
      .withMessage(
        'sessionType must be one of: flashcard, fill_blank, word_association.'
      ),

    handleValidationErrors,
  ],

  submitResult: [
    param('sessionId')
      .isUUID()
      .withMessage('URL parameter sessionId must be a valid UUID.'),

    body('wordId')
      .trim()
      .notEmpty()
      .withMessage('wordId is required.')
      .isUUID()
      .withMessage('wordId must be a valid UUID.'),

    body('result')
      .trim()
      .notEmpty()
      .withMessage('result is required.')
      .isIn(['correct', 'incorrect'])
      .withMessage("Result must be either 'correct' or 'incorrect'."),

    body('responseTimeMs')
      .optional()
      .isInt({ min: 0 })
      .withMessage('responseTimeMs must be a non-negative integer.'),

    handleValidationErrors,
  ],

  endSession: [
    param('sessionId')
      .isUUID()
      .withMessage('URL parameter sessionId must be a valid UUID.'),

    handleValidationErrors,
  ],
};

module.exports = reviewValidator;
