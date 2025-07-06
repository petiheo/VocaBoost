const { auth } = require('../config/database');
const authService = require('../services/auth.service');
const {
  generateEmailVerificationToken,
  generateToken,
} = require('../helpers/jwt.helper');
const emailService = require('../services/email.service');

class AuthController {
  async register(req, res) {
    try {
      const { email, password, role = 'learner' } = req.body;

      const isExistEmail = await authService.findUserByEmail(email);
      if (isExistEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered',
        });
      }

      const userData = await authService.insertIntoUsers(email, password, role);
      const verificationToken = generateEmailVerificationToken(userData.id);
      await authService.insertIntoAuthTokens(
        verificationToken,
        userData.id,
        `email_verification`,
        '24h'
      );
      await emailService.sendEmailVerification(email, verificationToken);

      const accessToken = generateToken({
        userId: userData.id,
        email,
        role,
      });

      return res.status(201).json({
        success: true,
        message:
          'Registration successful. Please check your email for verification.',
        data: {
          user: {
            id: userData.id,
            email,
            role,
            status: userData.account_status,
          },
          token: accessToken,
        },
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }
  }
}

module.exports = new AuthController();
