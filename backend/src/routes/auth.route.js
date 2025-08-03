const express = require('express');
const authRouter = express.Router();
const passport = require('passport');

const authValidators = require('../validators/auth.validator');
const authController = require('../controllers/auth.controller');
const authenticateMiddleware = require('../middlewares/authenticate.middleware');

// Registration & Login & Logout
authRouter.post(
  '/register',
  authValidators.register,
  authController.register
);

authRouter.post(
  '/login',
  authValidators.login,
  authController.login
);

authRouter.post('/logout', authController.logout);

// OAuth Routes
authRouter.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    prompt: 'select_account', // Force account selection
  })
);

authRouter.get('/google/callback', authController.googleCallback);

// Password Reset Flow
authRouter.post(
  '/forgot-password',
  authValidators.email,
  authController.forgotPassword
);

authRouter.post(
  '/reset-password',
  authValidators.resetPassword,
  authController.resetPassword
);

authRouter.get('/verify-email/:token', authController.verifyEmail);

authRouter.post(
  '/resend-verification',
  authValidators.email,
  authController.resendVerification
);

authRouter.post(
  '/get-account-status',
  authValidators.email,
  authController.getAccountStatus
);

authRouter.get('/validate-token', authenticateMiddleware, authController.validateToken);

module.exports = authRouter;
