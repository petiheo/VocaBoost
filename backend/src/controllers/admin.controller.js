const adminService = require('../services/admin.service');
const { ResponseUtils, ErrorHandler } = require('../utils');

class AdminController {
  // =================================================================
  //  TEACHER VERIFICATION
  // =================================================================

  async getPendingTeacherRequests(req, res) {
    try {
      const { page, limit, sortBy } = req.query;
      const result = await adminService.getPendingTeacherRequests({ page, limit, sortBy });
      
      return ResponseUtils.success(res, 'Pending teacher requests retrieved successfully.', result);
    } catch (error) {
      return ErrorHandler.handleError(res, error, 'Admin.getPendingTeacherRequests');
    }
  }

  async getTeacherRequestById(req, res) {
    try {
      const { requestId } = req.params;
      const request = await adminService.getTeacherRequestById(requestId);
      
      if (!request) {
        return ResponseUtils.notFound(res, 'Teacher verification request not found.');
      }
      
      return ResponseUtils.success(res, 'Teacher request details retrieved successfully.', { request });
    } catch (error) {
      return ErrorHandler.handleError(res, error, 'Admin.getTeacherRequestById');
    }
  }

  async approveTeacherRequest(req, res) {
    try {
      const { requestId } = req.params;
      const adminId = req.user.userId;
      
      const result = await adminService.approveTeacherRequest(requestId, adminId);
      
      return ResponseUtils.success(res, `Teacher request for '${result.user.display_name}' has been approved.`, {
        requestId: result.request.id,
        status: result.request.status,
        reviewedBy: result.request.reviewed_by,
      });
    } catch (error) {
      if (error.message.includes('not found or is not pending')) {
          return ResponseUtils.notFound(res, error.message);
      }
      return ErrorHandler.handleError(res, error, 'Admin.approveTeacherRequest');
    }
  }

  async rejectTeacherRequest(req, res) {
    try {
      const { requestId } = req.params;
      const { reason } = req.body;
      const adminId = req.user.userId;

      const result = await adminService.rejectTeacherRequest(requestId, adminId, reason);

      return ResponseUtils.success(res, `Teacher request for '${result.user.display_name}' has been rejected.`, {
        requestId: result.request.id,
        status: result.request.status,
        reason: result.request.rejection_reason,
        reviewedBy: result.request.reviewed_by,
      });
    } catch (error) {
      if (error.message.includes('not found or is not pending')) {
          return ResponseUtils.notFound(res, error.message);
      }
      return ErrorHandler.handleError(res, error, 'Admin.rejectTeacherRequest');
    }
  }

  // =================================================================
  //  CONTENT MODERATION (REPORTS)
  // =================================================================

  async getOpenReports(req, res) {
    try {
      const { page, limit } = req.query;
      const result = await adminService.getOpenReports({ page, limit });
      
      return ResponseUtils.success(res, 'Open content reports retrieved successfully.', result);
    } catch (error) {
      return ErrorHandler.handleError(res, error, 'Admin.getOpenReports');
    }
  }

  async getReportById(req, res) {
    try {
      const { reportId } = req.params;
      const report = await adminService.getReportById(reportId);

      if (!report) {
        return ResponseUtils.notFound(res, 'Content report not found.');
      }

      return ResponseUtils.success(res, 'Report details retrieved successfully.', { report });
    } catch (error) {
      return ErrorHandler.handleError(res, error, 'Admin.getReportById');
    }
  }

  async approveReport(req, res) {
    try {
      const { reportId } = req.params;
      const { notes } = req.body;
      const adminId = req.user.userId;
      
      const result = await adminService.resolveReport(reportId, adminId, 'approve', notes);
      
      return ResponseUtils.success(res, 'Report approved successfully. The associated content has been removed.', {
          reportId: result.id,
          status: result.status,
          resolution: 'approved',
          notes: result.resolution_notes,
          resolvedBy: result.resolver_id
      });
    } catch (error) {
       if (error.message.includes('not found or is not open')) {
          return ResponseUtils.notFound(res, error.message);
      }
      return ErrorHandler.handleError(res, error, 'Admin.approveReport');
    }
  }

  async dismissReport(req, res) {
    try {
      const { reportId } = req.params;
      const { notes } = req.body;
      const adminId = req.user.userId;

      const result = await adminService.resolveReport(reportId, adminId, 'dismiss', notes);

      return ResponseUtils.success(res, 'Report dismissed successfully. The content will remain on the platform.', {
          reportId: result.id,
          status: result.status,
          resolution: 'dismissed',
          notes: result.resolution_notes,
          resolvedBy: result.resolver_id
      });
    } catch (error) {
       if (error.message.includes('not found or is not open')) {
          return ResponseUtils.notFound(res, error.message);
      }
      return ErrorHandler.handleError(res, error, 'Admin.dismissReport');
    }
  }
}

module.exports = new AdminController();