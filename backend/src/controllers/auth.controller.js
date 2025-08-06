const authService = require('../services/auth.service');
const { generateToken } = require('../helpers/jwt.helper');
const passport = require('passport');
const { ResponseUtils, ErrorHandler } = require('../utils');
const logger = require('../utils/logger');
class AuthController {
  async register(req, res) {
    try {
      const { email, password, role = 'learner' } = req.body;
      const result = await authService.registerUser(email, password, role);

      return ResponseUtils.success(
        res,
        'Registration successful. Please check your email for verification.',
        result,
        201
      );
    } catch (error) {
      if (error.message === 'Email already registered') {
        return ResponseUtils.conflict(res, error.message);
      }
      return ErrorHandler.handleError(res, error, 'register', 'Registration failed');
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await authService.loginUser(email, password);

      return ResponseUtils.success(res, 'Login successful', result);
    } catch (error) {
      if (error.message === 'Invalid email or password') {
        return ResponseUtils.unauthorized(res, error.message);
      }
      if (
        error.message ===
        'This account was created with Google. Please sign in with Google instead.'
      ) {
        return ResponseUtils.error(res, error.message, 400);
      }
      if (
        error.message === 'Account has been deactivated' ||
        error.message === 'Account has been suspended'
      ) {
        return ResponseUtils.forbidden(res, error.message);
      }
      return ErrorHandler.handleError(res, error, 'login', 'Login failed');
    }
  }

  async googleCallback(req, res, next) {
    passport.authenticate('google', { session: false }, async (err, user, info) => {
      const frontendUrl = process.env.FRONTEND_URL;
      try {
        if (err) {
          logger.error('Google OAuth Error:', err);
          return res.redirect(`${frontendUrl}/login?error=oauth_failed`);
        }

        if (!user) {
          return res.redirect(`${frontendUrl}/login?error=access_denied`);
        }

        const accessToken = generateToken({
          userId: user.id,
          email: user.email,
          role: user.role,
        });

        // Pass isNewUser as separate URL parameter
        const redirectUrl = `${frontendUrl}/auth/success?token=${accessToken}&isNewUser=${user.isNewUser}`;
        res.redirect(redirectUrl);
      } catch (error) {
        logger.error('Google callback processing error:', error);
        res.redirect(`${frontendUrl}/login?error=processing_failed`);
      }
    })(req, res, next);
  }

  // TODO: frontend sẽ xử lý xóa JWT, sau này có thể triển khai thêm blacklist token
  async logout(req, res) {
    try {
      return ResponseUtils.success(res, 'Logout successful');
    } catch (error) {
      return ErrorHandler.handleError(res, error, 'logout', 'Logout failed', 400);
    }
  }

  // TODO: chú ý trường hợp xử lý tài khoản Google sau này
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      await authService.sendPasswordReset(email);

      return ResponseUtils.success(
        res,
        "If your email is registered, you'll receive a password reset link shortly."
      );
    } catch (error) {
      return ErrorHandler.handleError(
        res,
        error,
        'forgotPassword',
        'Forgot password failed'
      );
    }
  }

  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;
      await authService.resetPassword(token, newPassword);

      return ResponseUtils.success(
        res,
        'Password has been reset successfully. Please login with your new password.'
      );
    } catch (error) {
      if (error.message === 'Invalid or expired token') {
        return ResponseUtils.error(res, error.message, 400);
      }
      return ErrorHandler.handleError(
        res,
        error,
        'resetPassword',
        'Reset password failed'
      );
    }
  }

  async verifyEmail(req, res) {
    try {
      const token = req.params.token;
      const result = await authService.verifyEmailToken(token);

      return ResponseUtils.success(res, 'Email verified successfully.', result);
    } catch (error) {
      if (error.message === 'Invalid or expired verification token') {
        return ResponseUtils.error(res, error.message, 400);
      }
      return ErrorHandler.handleError(
        res,
        error,
        'verifyEmail',
        'Invalid or expired verification token'
      );
    }
  }

  async resendVerification(req, res) {
    try {
      const { email } = req.body;
      await authService.resendVerification(email);

      return ResponseUtils.success(
        res,
        'Verification email resent successfully. Please check your inbox'
      );
    } catch (error) {
      if (error.message === 'Email not found or already verified') {
        return ResponseUtils.error(res, error.message, 400);
      }
      return ErrorHandler.handleError(
        res,
        error,
        'resendVerification',
        'Email not found or already verified'
      );
    }
  }

  async getAccountStatus(req, res) {
    try {
      const { email } = req.body;
      const result = await authService.getAccountStatus(email);

      return ResponseUtils.success(res, 'Account status retrieved', result);
    } catch (error) {
      if (error.message === 'Email not found') {
        return ResponseUtils.notFound(res, error.message);
      }
      return ErrorHandler.handleError(
        res,
        error,
        'getAccountStatus',
        'Internal server error',
        500
      );
    }
  }

  async validateToken(req, res) {
    try {
      return ResponseUtils.success(res, 'Validate token successfully', req.user);
    } catch (error) {
      return ErrorHandler.handleError(
        res,
        error,
        'validateToken',
        'Internal server error',
        500
      );
    }
  }
}

module.exports = new AuthController();
