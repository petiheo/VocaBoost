const { body } = require('express-validator');

const classroomValidator = {
  create: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Classroom name is required'),

    body('description')
      .optional()
      .isString()
      .isLength({ max: 1000 })
      .withMessage('Description must be less than 1000 characters'),

    body('classroom_status')
      .trim()
      .notEmpty()
      .isIn(['private', 'public'])
      .withMessage('classroom_status must be either private or public'),

    body('capacity_limit')
      .notEmpty()
      .isInt({ min: 1, max: 100 })
      .withMessage('capacity_limit must be an integer between 1 and 100'),
  ],
  createAssignment: [
    body('vocabListId')
      .notEmpty()
      .withMessage('vocabListId is required')
      .bail()
      .isUUID()
      .withMessage('vocabListId must be a valid UUID'),

    body('title')
      .trim()
      .notEmpty()
      .withMessage('Assignment title is required')
      .bail()
      .isLength({ max: 255 })
      .withMessage('Title must be at most 255 characters'),

    body('exerciseMethod')
      .notEmpty()
      .withMessage('exerciseMethod is required')
      .bail()
      .isIn(['flashcard', 'fill_blank', 'word_association'])
      .withMessage('exerciseMethod must be one of: flashcard, fill_blank, word_association'),

    body('wordsPerReview')
      .notEmpty()
      .withMessage('wordsPerReview is required')
      .bail()
      .isInt({ min: 5, max: 30 })
      .withMessage('wordsPerReview must be an integer between 5 and 30'),

    body('startDate')
      .notEmpty()
      .withMessage('startDate is required')
      .bail()
      .isISO8601()
      .withMessage('startDate must be a valid ISO 8601 datetime'),

    body('dueDate')
      .notEmpty()
      .withMessage('dueDate is required')
      .bail()
      .isISO8601()
      .withMessage('dueDate must be a valid ISO 8601 datetime')
      .bail()
      .custom((value) => {
        const due = new Date(value);
        const now = new Date();
        if (due < now) {
          throw new Error('dueDate cannot be in the past');
        }
        return true;
      }),
  ]

};

module.exports = classroomValidator;