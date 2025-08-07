const logger = require('./logger');

/**
 * Database Connection Pool Monitor
 * Utilities to monitor and test database connection pool performance
 */
class DBPoolMonitor {
  constructor() {
    this.connectionTests = [];
    this.maxTestHistory = 100;
  }

  async testConnection(supabaseClient) {
    const startTime = Date.now();
    const testId = `test_${Date.now()}`;

    try {
      // Test basic connection
      const { data, error } = await supabaseClient
        .from('users')
        .select('count')
        .limit(1);

      if (error) throw error;

      const responseTime = Date.now() - startTime;
      const result = {
        testId,
        timestamp: new Date().toISOString(),
        success: true,
        responseTime,
        status: this._getResponseStatus(responseTime),
      };

      this._addTestResult(result);
      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const result = {
        testId,
        timestamp: new Date().toISOString(),
        success: false,
        responseTime,
        error: error.message,
        status: 'error',
      };

      this._addTestResult(result);
      throw error;
    }
  }

  async testConcurrentConnections(supabaseClient, concurrentConnections = 5) {
    logger.info(`Testing ${concurrentConnections} concurrent connections...`);
    const startTime = Date.now();

    try {
      const promises = Array(concurrentConnections)
        .fill()
        .map(() => this.testConnection(supabaseClient));

      const results = await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      const stats = {
        totalTests: results.length,
        successfulTests: results.filter((r) => r.success).length,
        failedTests: results.filter((r) => !r.success).length,
        averageResponseTime: Math.round(
          results.reduce((sum, r) => sum + r.responseTime, 0) / results.length
        ),
        maxResponseTime: Math.max(...results.map((r) => r.responseTime)),
        minResponseTime: Math.min(...results.map((r) => r.responseTime)),
        totalTestTime: totalTime,
        timestamp: new Date().toISOString(),
      };

      logger.info('Concurrent connection test completed:', stats);
      return {
        success: true,
        stats,
        results,
      };
    } catch (error) {
      logger.error('Concurrent connection test failed:', error.message);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  getPoolConfiguration() {
    const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

    return {
      enabled: !!dbUrl,
      connectionString: dbUrl ? this._maskConnectionString(dbUrl) : null,
      maxConnections: parseInt(process.env.DB_POOL_MAX) || 10,
      minConnections: parseInt(process.env.DB_POOL_MIN) || 2,
      acquireTimeout: parseInt(process.env.DB_ACQUIRE_TIMEOUT) || 30000,
      idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT) || 300000,
      createTimeout: parseInt(process.env.DB_CREATE_TIMEOUT) || 30000,
      connectionType: this._getConnectionType(dbUrl),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  getTestStatistics(lastN = 10) {
    const recentTests = this.connectionTests.slice(-lastN);

    if (recentTests.length === 0) {
      return {
        noTestsAvailable: true,
        message: 'No connection tests have been performed yet',
      };
    }

    const successfulTests = recentTests.filter((t) => t.success);
    const failedTests = recentTests.filter((t) => !t.success);

    return {
      totalTests: recentTests.length,
      successRate: ((successfulTests.length / recentTests.length) * 100).toFixed(1),
      successfulTests: successfulTests.length,
      failedTests: failedTests.length,
      averageResponseTime:
        successfulTests.length > 0
          ? Math.round(
              successfulTests.reduce((sum, t) => sum + t.responseTime, 0) /
                successfulTests.length
            )
          : 0,
      lastTestTime: recentTests[recentTests.length - 1]?.timestamp,
      performanceStatus: this._getPerformanceStatus(successfulTests),
    };
  }

  logPoolStatus() {
    const config = this.getPoolConfiguration();
    const stats = this.getTestStatistics();

    logger.info('=== Database Connection Pool Status ===');
    logger.info(`Pool Enabled: ${config.enabled ? '✅' : '❌'}`);

    if (config.enabled) {
      logger.info(`Connection Type: ${config.connectionType}`);
      logger.info(`Max Connections: ${config.maxConnections}`);
      logger.info(`Min Connections: ${config.minConnections}`);
      logger.info(`Recent Success Rate: ${stats.successRate}%`);
      logger.info(`Average Response Time: ${stats.averageResponseTime}ms`);
    } else {
      logger.info('Using Supabase REST API (no direct database pooling)');
    }

    logger.info('=======================================');
  }

  // Private helper methods
  _addTestResult(result) {
    this.connectionTests.push(result);

    // Keep only the last N tests
    if (this.connectionTests.length > this.maxTestHistory) {
      this.connectionTests = this.connectionTests.slice(-this.maxTestHistory);
    }
  }

  _getResponseStatus(responseTime) {
    if (responseTime < 100) return 'excellent';
    if (responseTime < 300) return 'good';
    if (responseTime < 1000) return 'acceptable';
    return 'slow';
  }

  _getConnectionType(dbUrl) {
    if (!dbUrl) return 'None (REST API)';
    if (dbUrl.includes('pooler.supabase.com:6543')) return 'Transaction Pooler ✅';
    if (dbUrl.includes('pooler.supabase.com:5432')) return 'Session Pooler ⚠️';
    if (dbUrl.includes('db.') && dbUrl.includes('.supabase.co'))
      return 'Direct Connection ⚠️';
    return 'Custom';
  }

  _maskConnectionString(connectionString) {
    return connectionString.replace(/:([^@]+)@/, ':****@');
  }

  _getPerformanceStatus(successfulTests) {
    if (successfulTests.length === 0) return 'unknown';

    const avgResponseTime =
      successfulTests.reduce((sum, t) => sum + t.responseTime, 0) /
      successfulTests.length;

    if (avgResponseTime < 100) return 'excellent';
    if (avgResponseTime < 300) return 'good';
    if (avgResponseTime < 1000) return 'acceptable';
    return 'needs_attention';
  }
}

// Export singleton instance
module.exports = new DBPoolMonitor();
