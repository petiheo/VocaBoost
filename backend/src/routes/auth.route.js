const express = require('express');
const authRouter = express.Router();

const rateLimiter = require('../middlewares/rateLimiter.middleware');
const authValidator = require('../validators/auth.validator');
const authController = require('../controllers/auth.controller');
const passport = require('passport');

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

authRouter.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

authRouter.get('/google/callback', authController.googleCallback);

authRouter.post('/logout', rateLimiter, authController.logout);

authRouter.post(
  '/forgot-password',
  rateLimiter,
  authValidator.email,
  authController.forgotPassword
);

authRouter.post(
  '/reset-password',
  rateLimiter,
  authValidator.resetPassword,
  authController.resetPassword
);

authRouter.post('/verify-email/:token', authController.verifyEmail);

authRouter.post(
  '/resend-verification',
  authValidator.email,
  authController.resendVerification
);

module.exports = authRouter;
