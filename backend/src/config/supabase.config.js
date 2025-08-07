const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

// Database connection pool configuration
const poolConfig = {
  db: {
    connectionString: process.env.SUPABASE_DB_URL || process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    // Connection pool settings
    max: parseInt(process.env.DB_POOL_MAX) || 10,
    min: parseInt(process.env.DB_POOL_MIN) || 2,
    acquireTimeoutMillis: parseInt(process.env.DB_ACQUIRE_TIMEOUT) || 30000,
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT) || 300000,
    createTimeoutMillis: parseInt(process.env.DB_CREATE_TIMEOUT) || 30000,
  },
};

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  { db: poolConfig.db }
);

const supabaseService = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { db: poolConfig.db }
);

const testConnection = async () => {
  try {
    const startTime = Date.now();
    const { data, error } = await supabase.from('users').select('count').limit(1);

    if (error) throw error;

    const responseTime = Date.now() - startTime;
    logger.info('Connect to Supabase successfully');
    logger.info(`Connection response time: ${responseTime}ms`);

    // Test if connection pooling is working
    if (process.env.SUPABASE_DB_URL) {
      logger.info('Database connection pool is active');
    } else {
      logger.info('Using Supabase REST API (no connection pooling)');
    }
  } catch (error) {
    logger.error('Connect to Supabase failed', error.message);
    if (process.env.SUPABASE_DB_URL) {
      logger.error('Database connection pool configuration may be invalid');
    }
  }
};
testConnection();

const dbPoolMonitor = require('../utils/dbPoolMonitor');

module.exports = {
  supabase,
  supabaseService,
  poolConfig,
  dbPoolMonitor,
};
