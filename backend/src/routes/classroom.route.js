const express = require('express');
classroomRouter = express.Router();

const classroomValidator = require('../validators/classroom.validator');
const classroomController = require('../controllers/classroom.controller');
const {
  requireRole,
  hasClassroomAccess,
  requireClassRole,
} = require('../middlewares/authorize.middleware');
const authenticate = require('../middlewares/auth.middleware');

classroomRouter.use(authenticate);

// Tạo lớp học mới
classroomRouter.post(
  '/create-classroom',
  requireRole('teacher'),
  classroomValidator.create,
  classroomController.createClassroom
);

classroomRouter.get(
  '/my-classrooms',
  requireRole('teacher'),
  classroomController.getMyClassrooms
);

classroomRouter.post('/join-request', classroomController.requestJoinByCode);

classroomRouter.get(
  '/:classroomId/join-requests',
  hasClassroomAccess,
  requireClassRole('teacher'),
  classroomController.getPendingJoinRequests
);

classroomRouter.post(
  '/:classroomId/approve-request',
  hasClassroomAccess,
  requireClassRole('teacher'),
  classroomController.approveJoinRequest
);

classroomRouter.post(
  '/:classroomId/reject-request',
  hasClassroomAccess,
  requireClassRole('teacher'),
  classroomController.rejectJoinRequest
);

classroomRouter.post(
  '/:classroomId/approve-all',
  hasClassroomAccess,
  requireClassRole('teacher'),
  classroomController.approveAllJoinRequests
);

classroomRouter.get(
  '/:classroomId/learners',
  hasClassroomAccess,
  classroomController.getJoinedLearners
);

classroomRouter.post(
  '/:classroomId/remove-learner',
  hasClassroomAccess,
  requireClassRole('teacher'),
  classroomController.removeLearner
);

classroomRouter.delete(
  '/:classroomId',
  hasClassroomAccess,
  requireClassRole('teacher', 'admin'),
  classroomController.deleteClassroom
);

classroomRouter.get(
  '/:classroomId/search-learners',
  hasClassroomAccess,
  classroomController.searchLearnersByDisplayName
);

classroomRouter.post(
  '/:classroomId/invitation',
  hasClassroomAccess,
  requireClassRole('teacher'),
  classroomController.inviteLearner
);

classroomRouter.post('/accept-invitation', classroomController.acceptInvitation);

classroomRouter.delete(
  '/:classroomId/invitation',
  hasClassroomAccess,
  requireClassRole('teacher'),
  classroomController.cancelInvitation
);

classroomRouter.post(
  '/:classroomId/assignment',
  hasClassroomAccess,
  requireClassRole('teacher'),
  classroomValidator.createAssignment,
  (req, res, next) => classroomController.createAssignment(req, res, next) // Chỉnh ở đây nè
  // Tao hỏi GPT thì nó bảo nếu mày truyền classroomController.createAssignment trực tiếp như một middleware cho Express
  // nó chỉ lấy tham chiếu đến hàm đó mà không giữ lại context (this) của đối tượng classroomController. . 
  // Do đó, khi Express (Express gọi hàm một cách độc lập) gọi hàm này, this ở bên trong nó sẽ là undefined, dẫn đến lỗi undefined._extractAssignmentData(...).
);

classroomRouter.get('/my-joined', classroomController.getMyJoinedClassrooms);

classroomRouter.get(
  '/:classroomId/invitations',
  hasClassroomAccess,
  requireClassRole('teacher'),
  classroomController.getClassroomInvitations
);

classroomRouter.get(
  '/:classroomId/assignments',
  hasClassroomAccess,
  requireClassRole('teacher'),
  classroomController.getClassroomAssignments
);

classroomRouter.get(
  '/:classroomId/assignments/to-review',
  hasClassroomAccess,
  requireClassRole('learner'),
  classroomController.getLearnerToReviewAssignments
);

classroomRouter.get(
  '/:classroomId/assignments/reviewed',
  hasClassroomAccess,
  requireClassRole('learner'),
  classroomController.getLearnerReviewedAssignments
);

classroomRouter.get(
  '/:classroomId/:assignmentId',
  hasClassroomAccess,
  requireClassRole('teacher'),
  classroomController.getAssignmentDetails
);

classroomRouter.patch(
  '/:classroomId/auto-approve',
  hasClassroomAccess,
  requireClassRole('teacher'),
  classroomController.changeAutoApproveSetting
);

classroomRouter.delete(
  '/:classroomId/:assignmentId',
  hasClassroomAccess,
  requireClassRole('teacher'),
  classroomController.deleteAssignment
);

classroomRouter.post(
  '/:classroomId/leave',
  hasClassroomAccess,
  requireClassRole('learner'),
  classroomController.leaveClassroom
);

classroomRouter.get(
  '/:classroomId/assignments/overdue',
  hasClassroomAccess,
  requireClassRole('learner'),
  classroomController.getLearnerOverdueAssignments
);

module.exports = classroomRouter;
