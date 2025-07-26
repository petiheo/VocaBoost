const userModel = require('../models/user.model');
const logger = require('../utils/logger');
const userProfileModel = require('../models/userProfile.model');
const classroomModel = require('../models/classroom.model');
const teacherService = require('./teacher.service');
const storageService = require('./storage.service');

class UserService {
  async getProfile(userId) {
    try {
      const profile = await userProfileModel.getProfile(userId);

      // Ensure settings exist
      if (!profile.user_settings) {
        profile.user_settings = await userProfileModel.getOrCreateSettings(userId);
      }

      // For teachers, get additional info
      if (profile.role === 'teacher') {
        const teacherStatus = await teacherService.getVerificationStatus(userId);
        profile.teacherVerification = teacherStatus;

        const classroomCount = await classroomModel.getClassroomCount(userId);
        profile.classroomCount = classroomCount;
      }

      const vocabularyListCount =
        await userProfileModel.getVocabularyListCount(userId);
      profile.vocabularyListCount = vocabularyListCount;

      return profile;
    } catch (error) {
      logger.error('Get profile failed:', error);
      throw error;
    }
  }

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

  async updateAvatar(userId, avatarFile) {
    const uploadResult = await storageService.uploadUserAvatar(avatarFile, userId);
    return await userModel.updateAvatar(userId, uploadResult.url);
  }

  async removeAvatar(userId) {
    return await userModel.updateAvatar(userId, null);
  }

  async updateProfile(userId, updateData, avatarFile = null) {
    const { displayName, removeAvatar, dailyGoal } = updateData;

    // Update individual fields
    if (displayName) {
      await userModel.updateDisplayName(userId, displayName);
    }

    if (dailyGoal) {
      await userModel.updateDailyGoal(userId, dailyGoal);
    }

    // Handle avatar updates
    if (avatarFile) {
      await this.updateAvatar(userId, avatarFile);
    } else if (removeAvatar) {
      await this.removeAvatar(userId);
    }

    // Return updated profile
    return await this.getProfile(userId);
  }

  async reportWord(reporterId, wordId, reason) {
    // Check if word exists
    const wordModel = require('../models/word.model');
    const word = await wordModel.findById(wordId);
    if (!word) {
      throw new Error('Word not found.');
    }

    // Check if user can report this content
    const canReport = await this.canReportContent(reporterId, wordId);
    if (!canReport) {
      throw new Error('You have already reported this content.');
    }

    // Create report
    const report = await this.reportContent(reporterId, wordId, reason);
    return {
      reportId: report.id,
      status: report.status,
      message: 'Word reported successfully. Our team will review it.',
    };
  }
}

module.exports = new UserService();
