const express = require('express');
const authRouter = express.Router();

const rateLimiter = require('../middlewares/rateLimiter.middleware');
const authValidator = require('../validators/auth.validator');
const authController = require('../controllers/auth.controller');

authRouter.post(
  '/register',
  rateLimiter,
  authValidator.register,
  authController.register
);

authRouter.post(
  '/login',
  rateLimiter,
  authValidator.login,
  authController.login
);

module.exports = authRouter;
