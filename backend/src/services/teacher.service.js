const userModel = require('../models/user.model');
const storageService = require('./storage.service');
const teacherRequestModel = require('../models/teacherRequest.model');
const logger = require('../utils/logger');

class TeacherService {
  async canSubmitRequest(userId) {
    const oldRequest = await teacherRequestModel.findByUserId(userId);
    if (!oldRequest) return true;

    if (oldRequest.status === 'rejected') {
      // Nếu đã trôi qua đủ thời gian thì cho submit lại (vd: 24h)
      const isValidTimePass =
        (Date.now() - new Date(oldRequest.created_at)) / (1000 * 60 * 60 * 24);
      return isValidTimePass >= 1;
    }

    return oldRequest.status !== 'pending' && oldRequest.status !== 'approved';
  }

  async submitRequest(userId, data, file) {
    try {
      const uploadResult = await storageService.uploadTeacherCredential(
        file,
        userId
      );

      const teacherRequest = await teacherRequestModel.create({
        userId,
        institution: data.institution,
        credentialsUrl: uploadResult.url,
        additionalNotes: data.additionalNotes,
      });

      if (data.fullName) await userModel.updateDisplayName(userId, data.fullName);
      await userModel.updateUserStatus(userId, 'pending_verification');
      await userModel.updateUserRole(userId, 'teacher');
      return teacherRequest;
    } catch (error) {
      logger.error('Submit verification failed: ', error);
      throw error;
    }
  }

  async getVerificationStatus(userId) {
    try {
      const request = await teacherRequestModel.findByUserId(userId);

      if (!request)
        return {
          status: 'not_submitted',
          message: 'No verification request found',
        };

      return {
        status: request.status,
        submittedAt: request.created_at,
        institution: request.institution,
        rejectionReason: request.rejection_reason,
        message: this.getStatusMessage(request.status),
      };
    } catch (error) {
      logger.error('Get verification status failed:', error);
      throw error;
    }
  }

  getStatusMessage(status) {
    const messages = {
      pending: 'Your verification request is being reviewed by our team.',
      approved: 'Congratulations! Your teacher account has been verified.',
      rejected:
        'Your verification request was not approved. Please check the reason and resubmit if needed.',
      not_submitted: 'You have not submitted a verification request yet.',
    };
    return messages[status] || 'Unknown status';
  }
}

module.exports = new TeacherService();
