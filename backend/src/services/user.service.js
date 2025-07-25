const userModel = require('../models/user.model');
const logger = require('../utils/logger');
const userProfileModel = require('../models/userProfile.model');
const teacherRequestModel = require('../models/teacherRequest.model');
const classroomModel = require('../models/classroom.model');
const teacherService = require('./teacher.service');

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
}

module.exports = new UserService();
