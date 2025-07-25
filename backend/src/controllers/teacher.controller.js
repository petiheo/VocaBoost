const teacherService = require('../services/teacher.service');
const logger = require('../utils/logger');

class TeacherController {
  async submitVerification(req, res) {
    try {
      const userId = req.user.userId;
      const { fullName, institution, schoolEmail, additionalNotes } = req.body;
      const file = req.file;

      const canSubmit = await teacherService.canSubmitRequest(userId);
      if (!canSubmit) {
        return res.status(400).json({
          success: false,
          message:
            'Submit verification failed, please check your existing request status.',
        });
      }

      const teacherRequest = await teacherService.submitRequest(
        userId,
        {
          fullName,
          institution,
          schoolEmail,
          additionalNotes,
        },
        file
      );

      return res.status(201).json({
        success: true,
        message:
          'Your teacher verification request has been submitted successfully.',
        data: {
          requestId: teacherRequest.id,
          status: teacherRequest.status,
          submittedAt: teacherRequest.created_at,
        },
      });
    } catch (error) {
      logger.error('Submit verification error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Submit verification request failed',
      });
    }
  }

  async getVerificationStatus(req, res) {
    try {
      const userId = req.user.userId;
      const result = await teacherService.getVerificationStatus(userId);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Get verification status error:', error);
      return res.status(400).json({
        success: false,
        message: 'Failed to get verification status',
      });
    }
  }
}

module.exports = new TeacherController();
