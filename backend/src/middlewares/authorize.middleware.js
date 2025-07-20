const classroomModel = require('../models/classroom.model');

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Insufficient permissions',
      });
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
      return res.status(404).json({
        success: false,
        message: 'Classroom not found or has been deleted.',
      });
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

    return res.status(403).json({
      success: false,
      message: 'You do not have access to this classroom.',
    });
  } catch (err) {
    console.error('hasClassroomAccess error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during access check.',
    });
  }
};

const requireClassRole = (...allowedRoles) => {
  return (req, res, next) => {
    const classRole = req.classRole; // set by hasClassroomAccess

    if (!classRole || !allowedRoles.includes(classRole)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient classroom permissions.',
      });
    }

    next();
  };
};

module.exports = {
  requireRole,
  hasClassroomAccess,
  requireClassRole,
};
