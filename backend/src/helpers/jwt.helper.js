const jwt = require('jsonwebtoken');
const TokenBlacklistModel = require('../models/tokenBlacklist.model');
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRE = process.env.JWT_EXPIRE;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET + '_refresh';

const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' }); // 15-minute access token
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' }); // 7-day refresh token
};

const generateTokenPair = (payload) => {
  const accessToken = generateToken(payload);
  const refreshToken = generateRefreshToken(payload);
  return { accessToken, refreshToken };
};

const generateEmailVerificationToken = (userId) => {
  return jwt.sign(
    {
      userId,
      type: 'email_verification',
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

const generateInvitationToken = (payload) => {
  return jwt.sign(
    {
      ...payload,
      type: 'classroom_invitation',
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE }
  );
};

const generateResetToken = (userId) => {
  return jwt.sign(
    {
      userId,
      type: 'password_reset',
    },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
};

const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

const verifyTokenWithBlacklist = async (token) => {
  // Check if token is blacklisted
  const isBlacklisted = await TokenBlacklistModel.isBlacklisted(token);
  if (isBlacklisted) {
    throw new Error('Token has been revoked');
  }
  return jwt.verify(token, JWT_SECRET);
};

const verifyRefreshToken = async (token) => {
  // Check if token is blacklisted
  const isBlacklisted = await TokenBlacklistModel.isBlacklisted(token);
  if (isBlacklisted) {
    throw new Error('Refresh token has been revoked');
  }
  return jwt.verify(token, JWT_REFRESH_SECRET);
};

const blacklistToken = async (token, tokenType = 'access', userId = null, reason = 'logout') => {
  try {
    // Decode token to get expiry and user info
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return false;
    }
    
    const userIdFromToken = userId || decoded.userId || decoded.sub;
    await TokenBlacklistModel.addToBlacklist(
      token,
      tokenType,
      userIdFromToken,
      decoded.exp,
      reason
    );
    return true;
  } catch (error) {
    console.error('Error blacklisting token:', error);
    return false;
  }
};

const refreshAccessToken = async (refreshToken) => {
  try {
    const decoded = await verifyRefreshToken(refreshToken);
    const newPayload = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };
    
    // Optional: Rotate refresh token (invalidate old one, issue new one)
    // This provides additional security but requires frontend changes
    // await blacklistToken(refreshToken, 'refresh', decoded.userId, 'refresh_rotation');
    
    return generateToken(newPayload);
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

module.exports = {
  generateToken,
  generateRefreshToken,
  generateTokenPair,
  generateEmailVerificationToken,
  generateInvitationToken,
  generateResetToken,
  verifyToken,
  verifyTokenWithBlacklist,
  verifyRefreshToken,
  blacklistToken,
  refreshAccessToken,
};
