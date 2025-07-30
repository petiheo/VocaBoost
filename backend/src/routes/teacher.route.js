const express = require('express');
const teacherRouter = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const uploadMiddleware = require('../middlewares/upload.middleware');
const teacherValidators = require('../validators/teacher.validator');
const teacherController = require('../controllers/teacher.controller');

teacherRouter.post(
  '/verification/submit',
  authMiddleware,
  uploadMiddleware.teacherCredentials,
  teacherValidators.submitVerification,
  teacherController.submitVerification
);

teacherRouter.get(
  '/verification/status',
  authMiddleware,
  teacherController.getVerificationStatus
);

module.exports = teacherRouter;
