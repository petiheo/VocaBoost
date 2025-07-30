const teacherService = require('../services/teacher.service');
const logger = require('../utils/logger');
const { ResponseUtils, ErrorHandler } = require('../utils');

class TeacherController {
  async submitVerification(req, res) {
    try {
      const userId = req.user.userId;
      const { fullName, institution, schoolEmail, additionalNotes } = req.body;
      const file = req.file;

      const canSubmit = await teacherService.canSubmitRequest(userId);
      if (!canSubmit) {
        return ResponseUtils.error(
          res,
          'Submit verification failed, please check your existing request status.',
          400
        );
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

      return ResponseUtils.success(
        res,
        'Your teacher verification request has been submitted successfully.',
        {
          requestId: teacherRequest.id,
          status: teacherRequest.status,
          submittedAt: teacherRequest.created_at,
        },
        201
      );
    } catch (error) {
      return ErrorHandler.handleError(
        res,
        error,
        'Teacher.submitVerification',
        'Submit verification request failed',
        400
      );
    }
  }

  async getVerificationStatus(req, res) {
    try {
      const userId = req.user.userId;
      const result = await teacherService.getVerificationStatus(userId);

      return ResponseUtils.success(res, '', result, 200);
    } catch (error) {
      return ErrorHandler.handleError(
        res,
        error,
        'Teacher.getVerificationStatus',
        'Failed to get verification status',
        400
      );
    }
  }
}

module.exports = new TeacherController();
