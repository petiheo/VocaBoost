const express = require('express');
const passport = require('passport');
const app = express();
const logger = require('./utils/logger');
const securityMiddleware = require('./middlewares/security.middleware');

const router = require('./routes/index.route');

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
    status: 'failed',
    message: 'Đã xảy ra lỗi!',
  });
});

module.exports = app;
