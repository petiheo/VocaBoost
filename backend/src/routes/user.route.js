const express = require('express');
const userRouter = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const rateLimiter = require('../middlewares/rateLimiter.middleware');
const userValidators = require('../validators/user.validator');
const userController = require('../controllers/user.controller');
const uploadMiddleware = require('../middlewares/upload.middleware');

userRouter.use(authMiddleware);

userRouter.get('/profile', userController.getProfile);

userRouter.put(
  '/profile',
  uploadMiddleware.userAvatar,
  userValidators.updateProfile,
  userController.updateProfile
);

userRouter.post(
  '/report',
  rateLimiter,
  userValidators.reportContent,
  userController.reportContent
);

userRouter.get('/profile/statistics', rateLimiter, userController.getUserStatistics);

module.exports = userRouter;
