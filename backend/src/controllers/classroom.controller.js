const classroomService = require('../services/classroom.service');
const { validationResult } = require('express-validator');

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

  async deleteClassroom(req, res) {
    try {
      const classroom = req.classroom;

      await classroomService.deleteClassroom(classroom);

      return res.status(200).json({
        success: true,
        message: 'Classroom has been deleted.',
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to delete classroom.',
      });
    }
  }

  async searchLearnersByDisplayName(req, res) {
    try {
      const classroomId = req.classroom.id;
      const { status, q } = req.query;

      const results = await classroomService.searchLearnersByDisplayName(classroomId, status, q);

      return res.status(200).json({
        success: true,
        data: results,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to search learners.',
      });
    }
  }

  async inviteLearner(req, res) {
    try {
      const classroomId = req.classroom.id;
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Missing email of learner.',
        });
      }

      const result = await classroomService.inviteLearner(classroomId, email);

      return res.status(200).json({
        success: true,
        message: 'Invitation has been sent.',
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to sent invitation.',
      });
    }
  }

  async acceptInvitation(req, res) {
    try {
      const { token } = req.body;
      const user = req.user;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Missing invitation token.',
        });
      }

      const result = await classroomService.acceptInvitation(token, user);

      return res.status(200).json({
        success: true,
        message: 'You have successfully joined the classroom.',
        data: result,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to accept invitation.',
      });
    }
  }

  async cancelInvitation(req, res) {
    try {
      const classroomId = req.classroom.id;
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Missing email in request body.',
        });
      }

      await classroomService.cancelInvitation(classroomId, email);

      return res.status(200).json({
        success: true,
        message: 'Invitation has been cancelled.',
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to cancel invitation.',
      });
    }
  }

  async createAssignment(req, res) {
    // Bắt lỗi từ validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(err => ({
          field: err.path,
          message: err.msg
        }))
      });
    }
    
    try {
      const classroomId = req.classroom.id;
      const teacherId = req.user.userId;
      const {
        vocabListId,
        title,
        exerciseMethod,
        wordsPerReview,
        startDate,
        dueDate
      } = req.body;

      const assignment = await classroomService.createAssignment({
        classroomId,
        teacherId,
        vocabListId,
        title,
        exerciseMethod,
        wordsPerReview,
        startDate,
        dueDate
      });

      return res.status(201).json({
        success: true,
        message: 'Assignment created successfully.',
        data: assignment
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to create assignment.'
      });
    }
  }

  async getMyJoinedClassrooms(req, res) {
    try {
      const learnerId = req.user.userId;
      const result = await classroomService.getJoinedClassroomsByLearner(learnerId);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to get joined classrooms.',
      });
    }
  }

  async getClassroomInvitations(req, res) {
    try {
      const classroomId = req.classroom.id;

      const invitations = await classroomService.getClassroomInvitations(classroomId);

      return res.status(200).json({
        success: true,
        data: invitations,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to get invitations.',
      });
    }
  }

  async getClassroomAssignments(req, res) {
    try {
      const classroomId = req.classroom.id;

      const assignments = await classroomService.getClassroomAssignments(classroomId);

      return res.status(200).json({
        success: true,
        data: assignments
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve assignments'
      });
    }
  }

}

module.exports = new ClassroomController();
