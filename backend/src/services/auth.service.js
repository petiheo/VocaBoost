const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const AuthToken = require('../models/authToken.model');
const ms = require('ms');
const {
  generateToken,
  generateEmailVerificationToken,
  generateResetToken,
} = require('../helpers/jwt.helper');
const emailService = require('./email.service');

class AuthService {
  async findUserByEmail(email) {
    return await userModel.findByEmail(email);
  }

  async insertIntoUsers(email, password, role) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return await userModel.create(email, hashedPassword, role);
  }

  async insertIntoAuthTokens(token, userId, tokenType, expiresIn) {
    const expiredAt = new Date(Date.now() + ms(expiresIn));
    return await AuthToken.create(token, userId, tokenType, expiredAt);
  }

  async validatePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  async isUsedToken(token) {
    const tokenInDb = await AuthToken.get(token);
    return (
      !tokenInDb ||
      tokenInDb.used_at !== null ||
      new Date(tokenInDb.expires_at) < new Date()
    );
  }

  async updateUsedAt(token) {
    return await AuthToken.updateUsedAt(token);
  }

  async updatePassword(userId, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return await userModel.updatePassword(userId, hashedPassword);
  }

  async verifyEmail(id) {
    return await userModel.verifyEmail(id);
  }

  async registerUser(email, password, role = 'learner') {
    // Check if email already exists
    const existingUser = await this.findUserByEmail(email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Create user
    const userData = await this.insertIntoUsers(email, password, role);

    // Generate verification token and send email
    const verificationToken = generateEmailVerificationToken(userData.id);
    await this.insertIntoAuthTokens(
      verificationToken,
      userData.id,
      'email_verification',
      '24h'
    );
    await emailService.sendEmailVerification(email, verificationToken);

    // Generate access token
    const accessToken = generateToken({
      userId: userData.id,
      email,
      role,
    });

    return {
      user: {
        id: userData.id,
        email,
        role,
        emailVerified: false,
      },
      token: accessToken,
    };
  }

  async loginUser(email, password) {
    // Find user by email
    const userData = await this.findUserByEmail(email);
    if (!userData) {
      throw new Error('Invalid email or password');
    }

    // Check if user has a password (Google OAuth users don't have passwords)
    if (!userData.password_hash) {
      throw new Error('This account was created with Google. Please sign in with Google instead.');
    }

    // Validate password
    const isValidPassword = await this.validatePassword(password, userData.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Check account status
    if (userData.account_status === 'inactive') {
      throw new Error('Account has been deactivated');
    }

    if (userData.account_status === 'suspended') {
      throw new Error('Account has been suspended');
    }

    // Generate access token
    const accessToken = generateToken({
      userId: userData.id,
      email,
      role: userData.role,
    });

    return {
      user: {
        id: userData.id,
        email,
        role: userData.role,
        avatarUrl: userData.avatar_url,
      },
      token: accessToken,
    };
  }

  async sendPasswordReset(email) {
    const userData = await this.findUserByEmail(email);
    if (!userData) {
      // Don't reveal if email exists for security
      return;
    }

    const resetToken = generateResetToken(userData.id);
    await this.insertIntoAuthTokens(resetToken, userData.id, 'password_reset', '1h');
    await emailService.sendPasswordReset(email, resetToken);
  }

  async resetPassword(token, newPassword) {
    const isTokenUsed = await this.isUsedToken(token);
    if (isTokenUsed) {
      throw new Error('Invalid or expired token');
    }

    const tokenData = await AuthToken.get(token);
    await this.updatePassword(tokenData.user_id, newPassword);
    await this.updateUsedAt(token);
  }

  async verifyEmailToken(token) {
    const isTokenUsed = await this.isUsedToken(token);
    if (isTokenUsed) {
      throw new Error('Invalid or expired verification token');
    }

    const tokenData = await AuthToken.get(token);
    const userData = await this.verifyEmail(tokenData.user_id);
    await this.updateUsedAt(token);

    const accessToken = generateToken({
      userId: userData.id,
      email: userData.email,
      role: userData.role,
    });

    return {
      user: {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        emailVerified: true,
      },
      token: accessToken,
    };
  }

  async resendVerification(email) {
    const userData = await this.findUserByEmail(email);
    if (!userData || userData.email_verified) {
      throw new Error('Email not found or already verified');
    }

    const verificationToken = generateEmailVerificationToken(userData.id);
    await this.insertIntoAuthTokens(
      verificationToken,
      userData.id,
      'email_verification',
      '24h'
    );
    await emailService.sendEmailVerification(email, verificationToken);
  }

  async getAccountStatus(email) {
    const userData = await this.findUserByEmail(email);
    if (!userData) {
      throw new Error('Email not found');
    }

    return {
      email,
      emailVerified: userData.email_verified,
      accountStatus: userData.account_status,
    };
  }
}

module.exports = new AuthService();
