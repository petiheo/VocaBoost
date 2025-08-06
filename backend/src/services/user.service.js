const userModel = require('../models/user.model');
const logger = require('../utils/logger');
const userProfileModel = require('../models/userProfile.model');
const statisticsModel = require('../models/statistics.model');
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
    const wordModel = require('../models/vocabulary.model');
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

  async getUserStatistics(userId) {
    try {
      // 1. Fetch data for the four summary cards
      const { data: summaryData, error: summaryError } =
        await statisticsModel.getSummaryStats(userId);
      if (summaryError) throw summaryError;

      // 2. Fetch data for the "Progress Over Time" chart
      const { data: progressData, error: progressError } =
        await statisticsModel.getProgressOverTime(userId);
      if (progressError) throw progressError;

      // 3. Fetch data for the "Completion Rate by List" chart
      const { data: completionData, error: completionError } =
        await statisticsModel.getCompletionRateByRecentList(userId, 5); // Get top 5 lists
      if (completionError) throw completionError;

      // 4. Fetch data for the "Study Consistency" calendar
      const { data: consistencyData, error: consistencyError } =
        await statisticsModel.getStudyConsistency(userId, 90); // Get consistency for the last 90 days
      if (consistencyError) throw consistencyError;

      return {
        summary: {
          wordsLearned: summaryData?.total_vocabulary || 0,
          currentStreak: summaryData?.current_streak || 0,
          longestStreak: summaryData?.longest_streak || 0,

          avgDailyStudyMinutes:
            Math.round(
              summaryData?.total_study_time / (summaryData?.total_study_days || 1)
            ) || 0,

          retentionRate:
            summaryData?.total_reviews > 0
              ? parseFloat(
                  (
                    (summaryData.correct_reviews / summaryData.total_reviews) *
                    100
                  ).toFixed(2)
                )
              : 0,
        },
        progressOverTime: progressData || [],
        completionRateByList: completionData || [],
        studyConsistency: (consistencyData || []).map((d) => d.study_date), // Extract just the date string
      };
    } catch (error) {
      logger.error(
        `[getLearningStatistics] Error fetching stats for user ${userId}:`,
        error
      );

      throw new Error('Failed to retrieve learning statistics.');
    }
  }
}

module.exports = new UserService();
