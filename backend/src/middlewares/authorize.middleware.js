const classroomModel = require('../models/classroom.model');
const logger = require('../utils/logger');
const { ResponseUtils, ErrorHandler } = require('../utils');

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ResponseUtils.unauthorized(res, 'Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      return ResponseUtils.forbidden(res, 'Insufficient permissions');
    }

    next();
  };
};

const hasClassroomAccess = async (req, res, next) => {
  try {
    const classroomId = req.params.classroomId;
    const { userId, role: globalRole } = req.user;
    const classroom = await classroomModel.getClassroomById(classroomId);
    if (!classroom || classroom.classroom_status === 'deleted') {
      return ResponseUtils.notFound(res, 'Classroom not found or has been deleted.');
    }

    // Admin has full access
    if (globalRole === 'admin') {
      req.classroom = classroom;
      req.classRole = 'admin';
      return next();
    }

    // Check if user is the teacher of the class
    if (classroom.teacher_id === userId) {
      req.classroom = classroom;
      req.classRole = 'teacher';
      return next();
    }

    // Check if user is a joined learner of the class
    const isJoined = await classroomModel.isJoinedLearner(classroomId, userId);
    if (isJoined) {
      req.classroom = classroom;
      req.classRole = 'learner';
      return next();
    }

    return ResponseUtils.forbidden(res, 'You do not have access to this classroom.');
  } catch (err) {
    return ErrorHandler.handleError(
      res,
      err,
      'hasClassroomAccess',
      'Internal server error during access check.',
      500
    );
  }
};

const requireClassRole = (...allowedRoles) => {
  return (req, res, next) => {
    const classRole = req.classRole; // set by hasClassroomAccess

    if (!classRole || !allowedRoles.includes(classRole)) {
      return ResponseUtils.forbidden(res, 'Insufficient classroom permissions.');
    }

    next();
  };
};

const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return ResponseUtils.unauthorized(res, 'Authentication required');
  }

  if (req.user.role !== 'admin') {
    return ResponseUtils.forbidden(res, 'Access denied. Admin role required.');
  }

  next();
};

module.exports = {
  requireRole,
  hasClassroomAccess,
  requireClassRole,
  requireAdmin,
};
