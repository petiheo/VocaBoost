const express = require('express');
const router = express.Router();
const ResponseUtils = require('../utils/response');
const ErrorHandler = require('../utils/errorHandler');

router.get('/', async (req, res) => {
  try {
    const { supabase } = require('../config/supabase.config');
    const startTime = Date.now();
    await supabase.from('users').select('count').limit(1);
    const dbResponseTime = Date.now() - startTime;

    // Get database connection pool information
    const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
    let connectionPoolInfo = {
      enabled: false,
      type: 'Supabase REST API',
    };

    if (dbUrl) {
      connectionPoolInfo.enabled = true;
      connectionPoolInfo.maxConnections = parseInt(process.env.DB_POOL_MAX) || 10;
      connectionPoolInfo.minConnections = parseInt(process.env.DB_POOL_MIN) || 2;
      connectionPoolInfo.acquireTimeout =
        parseInt(process.env.DB_ACQUIRE_TIMEOUT) || 30000;
      connectionPoolInfo.idleTimeout =
        parseInt(process.env.DB_IDLE_TIMEOUT) || 300000;

      // Detect connection type
      if (dbUrl.includes('pooler.supabase.com:6543')) {
        connectionPoolInfo.type = 'Transaction Pooler (Recommended)';
        connectionPoolInfo.status = 'optimal';
      } else if (dbUrl.includes('pooler.supabase.com:5432')) {
        connectionPoolInfo.type = 'Session Pooler';
        connectionPoolInfo.status = 'acceptable';
      } else if (dbUrl.includes('db.') && dbUrl.includes('.supabase.co')) {
        connectionPoolInfo.type = 'Direct Connection';
        connectionPoolInfo.status = 'limited';
      } else {
        connectionPoolInfo.type = 'Custom';
        connectionPoolInfo.status = 'unknown';
      }
    }

    return ResponseUtils.success(res, 'Service is healthy', {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      database: {
        connected: true,
        responseTime: `${dbResponseTime}ms`,
        connectionPool: connectionPoolInfo,
      },
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
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

module.exports = router;
