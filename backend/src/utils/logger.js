const winston = require('winston');
const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logFormat = winston.format.printf(({ timestamp, level, message, stack }) => {
  return stack
    ? `${timestamp} [${level}]: ${message} - ${stack}`
    : `${timestamp} [${level}]: ${message}`;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'http',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })
  ),
  transports: [
    // Console dành cho development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
      ),
    }),

    // File log cho error
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
      ),
    }),

    // File log cho tất cả các loại log
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
      ),
    }),
  ],
});

logger.http = (req, res, duration) => {
  const method = req.method;
  const url = req.originalUrl;
  const status = res.statusCode;
  const ip = req.ip;
  const log = `[${method}] ${url} - ${status} - ${duration}ms - IP: ${ip}`;

  logger.log({
    level: 'http',
    message: log,
  });
};

module.exports = logger;
