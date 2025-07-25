const userService = require('../services/user.service');
const logger = require('../utils/logger');
const wordModel = require('../models/word.model');

class UserController {
  async getProfile(req, res) {
    try {
      const userId = req.user.userId;
      const profile = await userService.getProfile(userId);

      return res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      logger.error(`Error getting profile for user ${req.user?.userId}:`, error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to get profile',
      });
    }
  }

  async reportContent(req, res) {
    try {
      const reporterId = req.user.userId;
      const { wordId, reason } = req.body;

      const wordExists = await wordModel.findById(wordId);
      if (!wordExists) {
        return res.status(404).json({
          success: false,
          message: 'Word not found.',
        });
      }

      const canReport = await userService.canReportContent(reporterId, wordId);
      if (!canReport) {
        return res.status(400).json({
          success: false,
          message: 'You have already reported this content.',
        });
      }

      const report = await userService.reportContent(reporterId, wordId, reason);
      return res.status(201).json({
        success: true,
        message: 'Word reported successfully. Our team will review it.',
        data: {
          reportId: report.id,
          status: report.status,
        },
      });
    } catch (error) {
      logger.error(`Report word by user ${req.user?.userId} failed:`, error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to report word',
      });
    }
  }
}

module.exports = new UserController();
