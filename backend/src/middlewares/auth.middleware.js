const { verifyToken } = require('../helpers/jwt.helper');
const userModel = require('../models/user.model');
const logger = require('../utils/logger');
const { ResponseUtils, ErrorHandler } = require('../utils');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ResponseUtils.unauthorized(res, 'No token provided');
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    const user = await userModel.findById(decoded.userId);
    if (!user) {
      return ResponseUtils.unauthorized(res, 'User not found');
    }

    if (user.account_status !== 'active') {
      return ResponseUtils.forbidden(res, `Account ${user.account_status}. Please contact support.`);
    }

    if (user.email_verified === false) {
      return ResponseUtils.forbidden(res, 'Email verification required');
    }

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: user.role, // Use current role from DB, not from token
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return ResponseUtils.unauthorized(res, 'Invalid token');
    }

    if (error.name === 'TokenExpiredError') {
      return ResponseUtils.unauthorized(res, 'Token expired');
    }

    return ErrorHandler.handleError(res, error, 'authMiddleware', 'Authentication error', 500);
  }
};

module.exports = authMiddleware;
