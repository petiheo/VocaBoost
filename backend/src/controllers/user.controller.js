const userService = require('../services/user.service');
const logger = require('../utils/logger');
const wordModel = require('../models/word.model');
const userModel = require('../models/user.model');

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
        message: error.message || 'Get profile failed',
      });
    }
  }

  async updateProfile(req, res) {
    try {
      const userId = req.user.userId;
      const { displayName, removeAvatar, dailyGoal } = req.body;
      const avatarFile = req.file;

      if (displayName) await userModel.updateDisplayName(userId, displayName);
      if (dailyGoal) await userModel.updateDailyGoal(userId, dailyGoal);
      if (avatarFile) {
        await userService.updateAvatar(userId, avatarFile);
      } else if (removeAvatar) {
        await userService.removeAvatar(userId);
      }

      const updatedProfile = await userService.getProfile(userId);
      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedProfile,
      });
    } catch (error) {
      logger.error('Update profile failed:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Update profile failed',
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
        message: error.message || 'Report word failed',
      });
    }
  }
}

module.exports = new UserController();
