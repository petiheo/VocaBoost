const { verifyTokenWithBlacklist } = require('../helpers/jwt.helper');
const userModel = require('../models/user.model');
const { ResponseUtils, ErrorHandler } = require('../utils');

const authenticateMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ResponseUtils.unauthorized(res, 'No token provided');
    }

    const token = authHeader.substring(7);
    const decoded = await verifyTokenWithBlacklist(token);

    const user = await userModel.findById(decoded.userId);
    if (!user) {
      return ResponseUtils.unauthorized(res, 'User not found');
    }

    // Block only specific problematic statuses, allow others like 'pending_verification'
    if (
      user.account_status === 'inactive' ||
      user.account_status === 'suspended' ||
      user.account_status === 'banned'
    ) {
      return ResponseUtils.forbidden(
        res,
        `Account ${user.account_status}. Please contact support.`
      );
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: user.role, // Use current role from DB, not from token
      emailVerified: user.email_verified,
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return ResponseUtils.unauthorized(res, 'Invalid token');
    }

    if (error.name === 'TokenExpiredError') {
      return ResponseUtils.unauthorized(res, 'Token expired');
    }

    return ErrorHandler.handleError(
      res,
      error,
      'authenticateMiddleware',
      'Authentication error',
      500
    );
  }
};

module.exports = authenticateMiddleware;
