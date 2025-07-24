const userModel = require('../models/user.model');
const logger = require('../utils/logger');

class UserService {
  async canReportContent(reporterId, wordId) {
    const hasReported = await userModel.hasReportedWord(reporterId, wordId);
    if (!hasReported) return true;
    return hasReported.status !== 'open';
  }

  async reportContent(reporterId, wordId, reason) {
    const report = await userModel.createReport(reporterId, wordId, reason);
    logger.info(`Content reported: Word ${wordId} by user ${reporterId}`);
    return report;
  }
}

module.exports = new UserService();
