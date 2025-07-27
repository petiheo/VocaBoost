const express = require('express');
const passport = require('passport');
const app = express();
const logger = require('./utils/logger');
const securityMiddleware = require('./middlewares/security.middleware');

const router = require('./routes/index.route');
const cors = require('cors');

require('./config/passport');

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
    const db = require('./config/database');
    await db.from('users').select('count').limit(1);

    return res.status(200).json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: error.message,
    });
  }
});

// =====ERROR HANDLING=====
// Ignore favicon request to avoid 404 logs
app.get('/favicon.ico', (req, res) => res.status(204).end());

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
  });
});

// 500 handler
app.use((err, req, res, next) => {
  logger.error(err.stack);
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

module.exports = app;
