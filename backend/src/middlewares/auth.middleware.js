const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = {
  verifyToken: (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: A token is required for authentication.',
      });
    }

    // The header format is "Bearer <token>"
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Token not found or malformed header.',
      });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);

      // Attach the decoded user payload to the request object
      // so subsequent handlers can access it (e.g., req.user.userId)
      req.user = decoded;
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized: Token has expired.',
        });
      }
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Invalid token.',
      });
    }

    // If token is valid, proceed to the next middleware/controller
    return next();
  },
};

module.exports = authMiddleware;
