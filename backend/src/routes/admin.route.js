const express = require('express');
const adminRouter = express.Router();

const authenticateMiddleware = require('../middlewares/authenticate.middleware');
const { requireAdmin } = require('../middlewares/authorize.middleware');

const adminValidator = require('../validators/admin.validator');
const adminController = require('../controllers/admin.controller');

adminRouter.use(authenticateMiddleware);
adminRouter.use(requireAdmin);

adminRouter.get(
  '/teacher-requests/pending',
  adminController.getPendingTeacherRequests
);

adminRouter.get(
  '/teacher-requests/:requestId',
  ...adminValidator.getRequestById,
  adminController.getTeacherRequestById
);

adminRouter.put(
  '/teacher-requests/:requestId/approve',
  ...adminValidator.getRequestById,
  adminController.approveTeacherRequest
);

adminRouter.put(
  '/teacher-requests/:requestId/reject',
  ...adminValidator.getRequestById,
  adminController.rejectTeacherRequest
);

adminRouter.get('/reports/open', adminController.getOpenReports);

adminRouter.get(
  '/reports/:reportId',
  ...adminValidator.getReportById,
  adminController.getReportById
);

adminRouter.put(
  '/reports/:reportId/approve',
  ...adminValidator.resolveReport,
  adminController.approveReport
);

adminRouter.put(
  '/reports/:reportId/dismiss',
  ...adminValidator.resolveReport,
  adminController.dismissReport
);

module.exports = adminRouter;
