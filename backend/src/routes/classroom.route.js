const express = require('express');
classroomRouter = express.Router();

const classroomValidator = require('../validators/classroom.validator');
const classroomController = require('../controllers/classroom.controller');
const { requireRole, hasClassroomAccess, requireClassRole } = require('../middlewares/authorize.middleware');
const authenticate = require('../middlewares/auth.middleware');

classroomRouter.use(authenticate);

// Tạo lớp học mới
classroomRouter.post('/create-classroom',
  requireRole('teacher'),
  classroomValidator.create,
  classroomController.createClassroom
);

classroomRouter.get('/my-classrooms', 
  requireRole('teacher'),
  classroomController.getMyClassrooms
);

classroomRouter.post('/join-request',
  classroomController.requestJoinByCode
);

classroomRouter.get('/:classroomId/join-requests',
  hasClassroomAccess,
  requireClassRole('teacher'),
  classroomController.getPendingJoinRequests
);

classroomRouter.post('/:classroomId/approve-request',
  hasClassroomAccess,
  requireClassRole('teacher'),
  classroomController.approveJoinRequest
);

classroomRouter.post('/:classroomId/reject-request',
  hasClassroomAccess,
  requireClassRole('teacher'),
  classroomController.rejectJoinRequest
);

classroomRouter.post('/:classroomId/approve-all',
  hasClassroomAccess,
  requireClassRole('teacher'),
  classroomController.approveAllJoinRequests
);

classroomRouter.get('/:classroomId/learners',
  hasClassroomAccess,
  classroomController.getJoinedLearners
);

classroomRouter.post('/:classroomId/remove-learner',
  hasClassroomAccess,
  requireClassRole('teacher'),
  classroomController.removeLearner
);

classroomRouter.delete('/:classroomId',
  hasClassroomAccess,
  requireClassRole('teacher', 'admin'),
  classroomController.deleteClassroom
);

classroomRouter.get('/:classroomId/search-learners',
  hasClassroomAccess,
  classroomController.searchLearnersByDisplayName
);

classroomRouter.post('/:classroomId/invitation',
  hasClassroomAccess,
  requireClassRole('teacher'),
  classroomController.inviteLearner
);

classroomRouter.post('/accept-invitation',
  classroomController.acceptInvitation
);

classroomRouter.delete('/:classroomId/invitation',
  hasClassroomAccess,
  requireClassRole('teacher'),
  classroomController.cancelInvitation
);

classroomRouter.post('/:classroomId/assignment',
  hasClassroomAccess,
  requireClassRole('teacher'),
  classroomValidator.createAssignment,
  classroomController.createAssignment
);






module.exports = classroomRouter;
