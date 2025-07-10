const classroomService = require('../services/classroom.service');

class ClassroomController {
  async createClassroom(req, res) {
    try {
      const { name, description, classroom_status, capacity_limit } = req.body;
      const { userId } = req.user;

      const newClassroom = await classroomService.createClassroom({
        name,
        description,
        teacher_id: userId,
        classroom_status,
        capacity_limit,
      });

      return res.status(201).json({
        success: true,
        message: 'Classroom created successfully',
        data: newClassroom,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message || 'Internal server error',
      });
    }
  }

  async getMyClassrooms(req, res) {
    try {
      const { userId } = req.user;

      const classrooms = await classroomService.getClassroomsByTeacherId(userId);

      return res.status(200).json({ 
        success: true, 
        data: classrooms 
      });
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  async requestJoinByCode(req, res) {
    try {
      const { joinCode } = req.body;
      const user = req.user;

      if (!joinCode) {
        return res.status(400).json({ success: false, message: 'Join code is required.' });
      }

      await classroomService.handleJoinRequestByCode(joinCode, user);
      return res.status(200).json({ 
        success: true, 
        message: 'Join request submitted.' 
      });
    } catch (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  async getPendingJoinRequests(req, res) {
    try {
      const classroomId = req.classroom.id;

      const pendingRequests = await classroomService.getPendingJoinRequests(classroomId);

      return res.status(200).json({
        success: true,
        data: pendingRequests,
      });
    } catch (err) {
      console.error('Error getting join requests:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch join requests.',
      });
    }
  }

  async approveJoinRequest(req, res) {
    try {
      const classroomId = req.classroom.id;
      const { learnerId } = req.body;

      if (!learnerId) {
        return res.status(400).json({
          success: false,
          message: 'Missing learnerId in request body.',
        });
      }

      await classroomService.approveJoinRequest(classroomId, learnerId);

      return res.status(200).json({
        success: true,
        message: 'Join request approved.',
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to approve join request.',
      });
    }
  }

  async rejectJoinRequest(req, res) {
    try {
      const classroomId = req.classroom.id;
      const { learnerId } = req.body;

      if (!learnerId) {
        return res.status(400).json({
          success: false,
          message: 'Missing learnerId in request body.',
        });
      }

      await classroomService.rejectJoinRequest(classroomId, learnerId);

      return res.status(200).json({
        success: true,
        message: 'Join request rejected.',
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to reject join request.',
      });
    }
  }
}

module.exports = new ClassroomController();
