const jwt = require('jsonwebtoken');

function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
}

function generateEmailVerificationToken(userId) {
  return jwt.sign(
    {
      userId,
      type: 'email_verification',
    },
    process.env.JWT_SECRET || 'vocaboost-secret-key',
    {
      expiresIn: '7d',
    }
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'vocaboost-secret-key');
  } catch (error) {
    throw new Error('Invalid token');
  }
}

module.exports = {
  generateToken,
  generateEmailVerificationToken,
  verifyToken,
};
