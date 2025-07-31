const userModel = require('../models/user.model');
const storageService = require('./storage.service');
const teacherRequestModel = require('../models/teacherRequest.model');
const logger = require('../utils/logger');

class TeacherService {

  async submitRequest(userId, data, file) {
    try {
      const uploadResult = await storageService.uploadTeacherCredential(
        file,
        userId
      );

      // Check if there's an existing request
      const existingRequest = await teacherRequestModel.findByUserId(userId);
      let teacherRequest;
      let isUpdate = false;

      if (existingRequest) {
        // Update existing request
        teacherRequest = await teacherRequestModel.update(existingRequest.id, {
          institution: data.institution,
          credentialsUrl: uploadResult.url,
          additionalNotes: data.additionalNotes,
        });
        isUpdate = true;
        logger.info(`Updated existing teacher verification request for user ${userId}`);
      } else {
        // Create new request
        teacherRequest = await teacherRequestModel.create({
          userId,
          institution: data.institution,
          credentialsUrl: uploadResult.url,
          additionalNotes: data.additionalNotes,
        });
        logger.info(`Created new teacher verification request for user ${userId}`);
      }

      // Update user information (always do this regardless of create/update)
      if (data.fullName) await userModel.updateDisplayName(userId, data.fullName);
      await userModel.updateUserStatus(userId, 'pending_verification');
      await userModel.updateUserRole(userId, 'teacher');

      return {
        teacherRequest,
        isUpdate,
      };
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
