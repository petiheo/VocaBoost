const express = require('express');
const passport = require('passport');
const app = express();
const logger = require('../utils/logger');
const securityMiddleware = require('../middlewares/security.middleware');
const ResponseUtils = require('../utils/response');
const ErrorHandler = require('../utils/errorHandler');

const router = require('../routes/index.route');

require('../config/passport.config');

app.use(express.json());

securityMiddleware(app);

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http(req, res, duration);
  });

  next();
});

app.use(passport.initialize());

app.get('/', (req, res) => {
  res.send('<h1 style="text-align:center">Welcome to Vocaboost\'s API 😁<h1>');
});

app.use('/api', router);

app.use('/health', async (req, res) => {
  try {
    const { supabase } = require('./config/supabase.config');
    await supabase.from('users').select('count').limit(1);

    return ResponseUtils.success(res, 'Service is healthy', {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (error) {
    return ErrorHandler.handleError(
      res,
      error,
      'Health Check',
      'Service is unhealthy',
      503
    );
  }
});

// =====ERROR HANDLING=====
// Ignore favicon request to avoid 404 logs
app.get('/favicon.ico', (req, res) => res.status(204).end());

// 404 handler
app.use((req, res) => {
  return ResponseUtils.notFound(res, 'Endpoint not found');
});

// 500 handler
app.use((err, req, res, next) => {
  logger.error(err.stack);
  return ResponseUtils.serverError(res, 'Internal server error', err);
});

module.exports = app;
