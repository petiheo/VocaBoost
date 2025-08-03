const express = require('express');
const teacherRouter = express.Router();
const authenticateMiddleware = require('../middlewares/authenticate.middleware');
const uploadMiddleware = require('../middlewares/upload.middleware');
const teacherValidators = require('../validators/teacher.validator');
const teacherController = require('../controllers/teacher.controller');

teacherRouter.post(
  '/verification/submit',
  authenticateMiddleware,
  uploadMiddleware.teacherCredentials,
  teacherValidators.submitVerification,
  teacherController.submitVerification
);

teacherRouter.get(
  '/verification/status',
  authenticateMiddleware,
  teacherController.getVerificationStatus
);

module.exports = teacherRouter;
