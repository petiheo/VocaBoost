const express = require('express');
const userRouter = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const rateLimiter = require('../middlewares/rateLimiter.middleware');
const userValidators = require('../validators/user.validator');
const userController = require('../controllers/user.controller');

userRouter.use(authMiddleware);

userRouter.post(
  '/report',
  rateLimiter,
  userValidators.reportContent,
  userController.reportContent
);

module.exports = userRouter;
