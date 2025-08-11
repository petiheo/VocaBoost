const TokenBlacklistModel = require('../models/tokenBlacklist.model');
const logger = require('./logger');

/**
 * Clean up expired tokens from the blacklist
 * This should be run periodically (e.g., daily via cron job)
 */
async function cleanupExpiredTokens() {
  try {
    logger.info('Starting token blacklist cleanup...');

    const deletedCount = await TokenBlacklistModel.cleanupExpired();

    logger.info(`Token cleanup completed. Removed ${deletedCount} expired tokens.`);

    // Get statistics for monitoring
    const stats = await TokenBlacklistModel.getStats();
    logger.info('Token blacklist statistics:', {
      total: stats.total,
      byReason: stats.byReason,
    });

    return deletedCount;
  } catch (error) {
    logger.error('Error during token cleanup:', error);
    throw error;
  }
}

/**
 * Run cleanup on a schedule
 * Can be called from a cron job or scheduler
 */
function scheduleCleanup(intervalHours = 24) {
  // Run immediately on startup
  cleanupExpiredTokens().catch((error) => {
    logger.error('Initial token cleanup failed:', error);
  });

  // Schedule periodic cleanup
  setInterval(
    async () => {
      try {
        await cleanupExpiredTokens();
      } catch (error) {
        logger.error('Scheduled token cleanup failed:', error);
      }
    },
    intervalHours * 60 * 60 * 1000
  );

  logger.info(`Token cleanup scheduled to run every ${intervalHours} hours`);
}

module.exports = {
  cleanupExpiredTokens,
  scheduleCleanup,
};
