const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRE = process.env.JWT_EXPIRE;

const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

const generateEmailVerifyToken = (userId) => {
  return jwt.sign(
    {
      userId,
      type: 'email_verification',
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

module.exports = {
  generateToken,
  generateEmailVerifyToken,
};
