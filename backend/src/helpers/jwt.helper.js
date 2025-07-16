const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRE = process.env.JWT_EXPIRE;

const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRE });
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
  return jwt.sign({ ...payload, type: 'classroom_invitation' }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

module.exports = {
  generateToken,
  generateEmailVerificationToken,
  generateInvitationToken,
};
