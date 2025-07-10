const express = require('express');
classroomRouter = express.Router();

const classroomValidator = require('../validators/classroom.validator');
const classroomController = require('../controllers/classroom.controller');
const { requireRole, hasClassroomAccess } = require('../middlewares/authorize.middleware');
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
  requireRole('teacher'),
  hasClassroomAccess,
  classroomController.getPendingJoinRequests
);

module.exports = classroomRouter;
