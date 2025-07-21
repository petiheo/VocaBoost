const helmet = require('helmet');
const logger = require('../utils/logger');
const cors = require('cors');

const securityMiddleware = (app) => {
  // Basic security headers with helmet
  app.use(
    helmet({
      contentSecurityPolicy:
        process.env.NODE_ENV === 'production' ? undefined : false,
      crossOriginEmbedderPolicy: false,
    })
  );

  // Disable X-Powered-By header
  app.disable('x-powered-by');

  // Prevent parameter pollution
  app.use((req, res, next) => {
    // Clean up query params
    for (const key in req.query) {
      if (Array.isArray(req.query[key])) {
        req.query[key] = req.query[key][req.query[key].length - 1];
      }
    }
    next();
  });

  // Basic XSS Protection
  app.use((req, res, next) => {
    // Add security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    );

    // Prevent caching of sensitive data
    if (req.url.includes('/api/')) {
      res.setHeader(
        'Cache-Control',
        'no-store, no-cache, must-revalidate, proxy-revalidate'
      );
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }

    next();
  });

  // Log suspicious patterns
  app.use((req, res, next) => {
    const suspiciousPatterns = [
      /(\.\.\/)/, // Path traversal
      /<script/i, // XSS attempt
      /union.*select/i, // SQL injection
      /\${.*}/, // Template injection
    ];

    const url = req.url + (req.body ? JSON.stringify(req.body) : '');

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(url)) {
        logger.warn('Suspicious request pattern detected', {
          pattern: pattern.toString(),
          url: req.url,
          ip: req.ip,
          userAgent: req.get('user-agent'),
        });
        break;
      }
    }

    next();
  });

  // CORS configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        const allowedOrigins = [
          process.env.FRONTEND_URL,
          'http://localhost:3001',
          'http://localhost:3000',
        ];

        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    })
  );

  logger.info('Security middleware initialized');
};

module.exports = securityMiddleware;
