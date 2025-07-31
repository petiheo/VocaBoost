const teacherService = require('../services/teacher.service');
const logger = require('../utils/logger');
const { ResponseUtils, ErrorHandler } = require('../utils');

class TeacherController {
  async submitVerification(req, res) {
    try {
      const userId = req.user.userId;
      const { fullName, institution, schoolEmail, additionalNotes } = req.body;
      const file = req.file;

      const result = await teacherService.submitRequest(
        userId,
        {
          fullName,
          institution,
          schoolEmail,
          additionalNotes,
        },
        file
      );

      const message = result.isUpdate 
        ? 'Your teacher verification request has been updated successfully.'
        : 'Your teacher verification request has been submitted successfully.';

      return ResponseUtils.success(
        res,
        message,
        {
          requestId: result.teacherRequest.id,
          status: result.teacherRequest.status,
          submittedAt: result.teacherRequest.created_at,
          isUpdate: result.isUpdate,
        },
        result.isUpdate ? 200 : 201
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
