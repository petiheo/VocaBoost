const express = require('express');
const userRouter = express.Router();
const authenticateMiddleware = require('../middlewares/authenticate.middleware');
const userValidators = require('../validators/user.validator');
const userController = require('../controllers/user.controller');
const uploadMiddleware = require('../middlewares/upload.middleware');

userRouter.use(authenticateMiddleware);

userRouter.get('/profile', userController.getProfile);

userRouter.put(
  '/profile',
  uploadMiddleware.userAvatar,
  userValidators.updateProfile,
  userController.updateProfile
);

userRouter.post(
  '/report',
  userValidators.reportContent,
  userController.reportContent
);

userRouter.get('/profile/statistics', userController.getUserStatistics);

module.exports = userRouter;
