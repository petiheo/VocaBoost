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

      const result = await classroomService.handleJoinRequestByCode(joinCode, user);

      return res.status(200).json({
        success: true,
        message: result.autoApproved
          ? 'You have joined the classroom.'
          : 'Join request submitted. Please wait for approval.',
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

  async approveAllJoinRequests(req, res) {
    try {
      const classroomId = req.classroom.id;

      const result = await classroomService.approveAllJoinRequests(classroomId);

      return res.status(200).json({
        success: true,
        message: `Approved ${result} learners.`,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Failed to approve join requests.',
      });
    }
  }

  async getJoinedLearners(req, res) {
    try {
      const classroomId = req.classroom.id;

      const learners = await classroomService.getJoinedLearners(classroomId);

      return res.status(200).json({
        success: true,
        data: learners,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch learner list.',
      });
    }
  }

  async removeLearner(req, res) {
    try {
      const classroomId = req.classroom.id;
      const { learnerId } = req.body;

      if (!learnerId) {
        return res.status(400).json({
          success: false,
          message: 'Missing learnerId in request body.',
        });
      }

      await classroomService.removeLearner(classroomId, learnerId);

      return res.status(200).json({
        success: true,
        message: 'Learner has been removed from the classroom.',
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to remove learner.',
      });
    }
  }
}

module.exports = new ClassroomController();
