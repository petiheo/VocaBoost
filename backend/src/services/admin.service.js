const adminModel = require('../models/admin.model');
const userModel = require('../models/user.model');
const vocabularyModel = require('../models/vocabulary.model');
const storageService = require('./storage.service');
const emailService = require('./email.service');
const { STORAGE_BUCKETS } = require('../config/storage.config');
const logger = require('../utils/logger');

class AdminService {
  // =================================================================
  //  TEACHER VERIFICATION
  // =================================================================

  async getPendingTeacherRequests({ page = 1, limit = 20, sortBy = 'created_at:asc' }) {
    const { from, to } = this._getPagination(page, limit);
    const { data, error, count } = await adminModel.findPendingTeacherRequests({ from, to, sortBy });

    if (error) throw error;
    
    return {
      requests: data,
      pagination: this._formatPagination(page, limit, count),
    };
  }

  async getTeacherRequestById(requestId) {
    const { data: request, error } = await adminModel.findTeacherRequestById(requestId);
    if (error) throw error;
    if (!request) return null;

    return request;
  }

  async approveTeacherRequest(requestId, adminId) {
    const { data: originalRequest, error: findError } = await adminModel.findTeacherRequestById(requestId);
    if (findError) throw findError;
    if (!originalRequest || originalRequest.status !== 'pending') {
      throw new Error('Teacher request not found or is not pending.');
    }

    const userProfile = await userModel.findById(originalRequest.user.userId);

    const { data: updatedRequest, error: updateRequestError } = await adminModel.updateTeacherRequestStatus(requestId, 'approved', adminId);
    if (updateRequestError) throw updateRequestError;

    return { request: updatedRequest, user: userProfile};
  }

  async rejectTeacherRequest(requestId, adminId, reason) {
    const { data: originalRequest, error: findError } = await adminModel.findTeacherRequestById(requestId);
    if (findError) throw findError;
    if (!originalRequest || originalRequest.status !== 'pending') {
      throw new Error('Teacher request not found or is not pending.');
    }

    const userProfile = await userModel.findById(originalRequest.user.userId);

    const { data: updatedRequest, error: updateRequestError } = await adminModel.updateTeacherRequestStatus(requestId, 'rejected', adminId, reason);
    if (updateRequestError) throw updateRequestError;

    return { request: updatedRequest, user: userProfile};
  }

  // =================================================================
  //  CONTENT MODERATION (REPORTS)
  // =================================================================

  async getOpenReports({ page = 1, limit = 20 }) {
    const { from, to } = this._getPagination(page, limit);
    const { data, error, count } = await adminModel.findOpenReports({ from, to });
    
    if (error) throw error;
    
    return {
      reports: data,
      pagination: this._formatPagination(page, limit, count),
    };
  }

  async getReportById(reportId) {
    const { data: report, error } = await adminModel.findReportById(reportId);
    if (error) throw error;
    return report;
  }

  async resolveReport(reportId, adminId, action, notes) {
    const { data: report, error: findError } = await adminModel.findReportById(reportId);
    if (findError) throw findError;
    if (!report || report.status !== 'open') {
      throw new Error('Report not found or is not open.');
    }

    // If the report is approved, the content is bad and must be deleted.
    if (action === 'resolved') {
      await vocabularyModel.deleteWord(report.word_id);
    }

    // Update the report itself with the resolution
    const { data: updatedReport, error: updateError } = await adminModel.updateReportStatus(reportId, action, adminId, notes);
    if (updateError) throw updateError;
    
    return updatedReport;
  }
  
  // =================================================================
  //  PRIVATE HELPER METHODS
  // =================================================================
  
  _getPagination(page, size) {
    const limit = size ? +size : 20;
    const from = page ? (page - 1) * limit : 0;
    const to = page ? from + size - 1 : size - 1;
    return { from, to };
  }
  
  _formatPagination(page, limit, totalItems) {
    const currentPage = Number(page);
    const totalPages = Math.ceil(totalItems / limit);
    return { currentPage, totalPages, totalItems: totalItems || 0, limit: Number(limit) };
  }
}

module.exports = new AdminService();