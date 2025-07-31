const userService = require('../services/user.service');
const { ResponseUtils, ErrorHandler } = require('../utils');

class UserController {
  async getProfile(req, res) {
    try {
      const userId = req.user.userId;
      const profile = await userService.getProfile(userId);

      return ResponseUtils.success(res, 'Profile retrieved successfully', profile);
    } catch (error) {
      return ErrorHandler.handleError(
        res,
        error,
        `getProfile - User ${req.user?.userId}`,
        'Get profile failed',
        500
      );
    }
  }

  async updateProfile(req, res) {
    try {
      const userId = req.user.userId;
      const updateData = req.body;
      const avatarFile = req.file;

      const updatedProfile = await userService.updateProfile(
        userId,
        updateData,
        avatarFile
      );

      return ResponseUtils.success(
        res,
        'Profile updated successfully',
        updatedProfile
      );
    } catch (error) {
      return ErrorHandler.handleError(
        res,
        error,
        'updateProfile',
        'Update profile failed',
        500
      );
    }
  }

  async reportContent(req, res) {
    try {
      const reporterId = req.user.userId;
      const { wordId, reason } = req.body;

      const result = await userService.reportWord(reporterId, wordId, reason);

      return ResponseUtils.success(
        res,
        result.message,
        {
          reportId: result.reportId,
          status: result.status,
        },
        201
      );
    } catch (error) {
      if (error.message === 'Word not found.') {
        return ResponseUtils.notFound(res, error.message);
      }
      if (error.message === 'You have already reported this content.') {
        return ResponseUtils.error(res, error.message, 400);
      }
      return ErrorHandler.handleError(
        res,
        error,
        `reportContent - User ${req.user?.userId}`,
        'Report word failed',
        500
      );
    }
  }

  async getUserStatistics(req, res) {
    try {
      const userId = req.user.userId;
      const profile = await userService.getUserStatistics(userId);

      return ResponseUtils.success(res, 'Profile retrieved successfully', profile);
    } catch (error) {
      return ErrorHandler.handleError(
        res,
        error,
        `getProfile - User ${req.user?.userId}`,
        'Get profile failed',
        500
      );
    }
  }
}

module.exports = new UserController();
