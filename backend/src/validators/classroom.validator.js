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
};

module.exports = classroomValidator;