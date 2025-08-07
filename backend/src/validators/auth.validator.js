const { body } = require('express-validator');
const { commonValidators, handleValidationErrors } = require('./common.validator');

const authValidators = {
  register: [
    commonValidators.email(),
    commonValidators.password(),
    body('role')
      .optional()
      .trim()
      .isIn(['learner', 'teacher'])
      .withMessage('Role must be learner or teacher')
      .escape(),
    handleValidationErrors,
  ],

  login: [
    commonValidators.email(),
    body('password').notEmpty().withMessage('Password is required').escape(),
    handleValidationErrors,
  ],

  resetPassword: [
    body('token').trim().notEmpty().withMessage('Reset token is required').escape(),
    commonValidators.password('newPassword'),
    handleValidationErrors,
  ],

  email: [commonValidators.email()],
};

module.exports = authValidators;
