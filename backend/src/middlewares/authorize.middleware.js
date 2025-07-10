const classroomModel = require('../models/classroom.model');

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        error: 'Authentication required' 
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        error: 'Forbidden', 
        message: 'Insufficient permissions' 
      });
    }
    
    next();
  };
};

const hasClassroomAccess = async (req, res, next) => {
  try {
    const classroomId = req.params.classroomId;
    const { userId, role } = req.user;

    const classroom = await classroomModel.getClassroomById(classroomId);
    if (!classroom || classroom.classroom_status === 'deleted') {
      return res.status(404).json({
        success: false,
        message: 'Classroom not found or has been deleted.',
      });
    }

    // Admin has access by default (optional)
    if (role === 'admin') {
      req.classroom = classroom;
      return next();
    }

    // Teacher who owns the class
    if (classroom.teacher_id === userId) {
      req.classroom = classroom;
      return next();
    }

    // Learner who has joined
    const isJoined = await classroomModel.isJoinedLearner(classroomId, userId);
    if (isJoined) {
      req.classroom = classroom;
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

module.exports = {
  requireRole,
  hasClassroomAccess
};