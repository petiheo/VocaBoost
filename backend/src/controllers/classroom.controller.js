const classroomService = require('../services/classroom.service');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');
const ErrorHandler = require('../utils/errorHandler');

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
    } catch (error) {
      logger.error(
        `[createClassroom] Error creating classroom for teacher ${req.user?.userId}:`,
        err
      );
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error',
      });
    }
  }

  async getMyClassrooms(req, res) {
    try {
      const { userId } = req.user;

      const classrooms = await classroomService.getClassroomsByTeacherId(userId);

      return res.status(200).json({
        success: true,
        data: classrooms,
      });
    } catch (error) {
      logger.error(
        `[getMyClassrooms] Error fetching classrooms for teacher ${req.user?.userId}:`,
        error
      );
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to get classroom.',
      });
    }
  }

  async requestJoinByCode(req, res) {
    try {
      const { joinCode } = req.body;
      const user = req.user;

      if (!joinCode) {
        return res
          .status(400)
          .json({ success: false, message: 'Join code is required.' });
      }

      const result = await classroomService.handleJoinRequestByCode(joinCode, user);

      return res.status(200).json({
        success: true,
        message: result.autoApproved
          ? 'You have joined the classroom.'
          : 'Join request submitted. Please wait for approval.',
      });
    } catch (error) {
      logger.error(
        `[requestJoinByCode] Error handling join request for user ${req.user?.userId} with code ${req.body?.joinCode}:`,
        error
      );
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to requests to join classroom.',
      });
    }
  }

  async getPendingJoinRequests(req, res) {
    try {
      const classroomId = req.classroom.id;

      const pendingRequests =
        await classroomService.getPendingJoinRequests(classroomId);

      return res.status(200).json({
        success: true,
        data: pendingRequests,
      });
    } catch (error) {
      logger.error(
        `[getPendingJoinRequests] Error getting join requests for classroom ${req.classroom?.id}:`,
        err
      );
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch join requests.',
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
    } catch (error) {
      logger.error(
        `[approveJoinRequest] Error approving join request for learner ${req.body?.learnerId} in classroom ${req.classroom?.id}:`,
        err
      );
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to approve join request.',
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
    } catch (error) {
      logger.error(
        `[rejectJoinRequest] Error rejecting join request for learner ${req.body?.learnerId} in classroom ${req.classroom?.id}:`,
        err
      );
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to reject join request.',
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
    } catch (error) {
      logger.error(
        `[approveAllJoinRequests] Error approving all requests for classroom ${req.classroom?.id}:`,
        err
      );
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to approve join requests.',
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
    } catch (error) {
      logger.error(
        `[getJoinedLearners] Error fetching learner list for classroom ${req.classroom?.id}:`,
        err
      );
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch learner list.',
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
    } catch (error) {
      logger.error(
        `[removeLearner] Error removing learner ${req.body?.learnerId} from classroom ${req.classroom?.id}:`,
        err
      );
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to remove learner.',
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
    } catch (error) {
      logger.error(
        `[deleteClassroom] Error deleting classroom ${req.classroom?.id}:`,
        err
      );
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete classroom.',
      });
    }
  }

  async searchLearnersByDisplayName(req, res) {
    try {
      const classroomId = req.classroom.id;
      const { status, q } = req.query;

      const results = await classroomService.searchLearnersByDisplayName(
        classroomId,
        status,
        q
      );

      return res.status(200).json({
        success: true,
        data: results,
      });
    } catch (error) {
      logger.error(
        `[searchLearnersByDisplayName] Error searching learners in classroom ${req.classroom?.id} with query "${req.query?.q}":`,
        err
      );
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to search learners.',
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
    } catch (error) {
      logger.error(
        `[inviteLearner] Error inviting learner with email ${req.body?.email} to classroom ${req.classroom?.id}:`,
        err
      );
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to sent invitation.',
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
    } catch (error) {
      logger.error(
        `[acceptInvitation] Error accepting invitation for user ${req.user?.userId}:`,
        err
      );
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to accept invitation.',
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
    } catch (error) {
      logger.error(
        `[cancelInvitation] Error canceling invitation for email ${req.body?.email} in classroom ${req.classroom?.id}:`,
        err
      );
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to cancel invitation.',
      });
    }
  }

  _extractAssignmentData(req) {
    const classroomId = req.classroom.id;
    const teacherId = req.user.userId;
    const {
      vocabListId,
      title,
      exerciseMethod,
      wordsPerReview,
      startDate,
      dueDate,
    } = req.body;

    return {
      classroomId,
      teacherId,
      vocabListId,
      title,
      exerciseMethod,
      wordsPerReview,
      startDate,
      dueDate,
    };
  }

  async createAssignment(req, res) {
    try {
      const assignmentData = this._extractAssignmentData(req);
      const assignment = await classroomService.createAssignment(assignmentData);

      return res.status(201).json({
        success: true,
        message: 'Assignment created successfully.',
        data: assignment,
      });
    } catch (error) {
      return ErrorHandler.handleError(
        res,
        error,
        'createAssignment',
        'Failed to create assignment.'
      );
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
    } catch (error) {
      logger.error(
        `[getMyJoinedClassrooms] Error getting joined classrooms for learner ${req.user?.userId}:`,
        err
      );
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to get joined classrooms.',
      });
    }
  }

  async getClassroomInvitations(req, res) {
    try {
      const classroomId = req.classroom.id;

      const invitations =
        await classroomService.getClassroomInvitations(classroomId);

      return res.status(200).json({
        success: true,
        data: invitations,
      });
    } catch (error) {
      logger.error(
        `[getClassroomInvitations] Error getting invitations for classroom ${req.classroom?.id}:`,
        err
      );
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to get invitations.',
      });
    }
  }

  async getClassroomAssignments(req, res) {
    try {
      const classroomId = req.classroom.id;

      const assignments =
        await classroomService.getClassroomAssignments(classroomId);

      return res.status(200).json({
        success: true,
        data: assignments,
      });
    } catch (error) {
      logger.error(
        `[getClassroomAssignments] Error retrieving assignments for classroom ${req.classroom?.id}:`,
        err
      );
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve assignments',
      });
    }
  }

  async getLearnerToReviewAssignments(req, res) {
    try {
      const classroomId = req.classroom.id;
      const learnerId = req.user.userId;

      const result = await classroomService.getLearnerToReviewAssignments(
        classroomId,
        learnerId
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error(
        `[getLearnerToReviewAssignments] Error loading assignments for learner ${req.user?.userId} in classroom ${req.classroom?.id}:`,
        err
      );
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to load assignments.',
      });
    }
  }

  async getLearnerReviewedAssignments(req, res) {
    try {
      const classroomId = req.classroom.id;
      const learnerId = req.user.userId;

      const result = await classroomService.getLearnerReviewedAssignments(
        classroomId,
        learnerId
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error(
        `[getLearnerReviewedAssignments] Error loading reviewed assignments for learner ${req.user?.userId} in classroom ${req.classroom?.id}:`,
        err
      );
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to load reviewed assignments.',
      });
    }
  }

  async getLearnerOverdueAssignments(req, res) {
    try {
      const classroomId = req.classroom.id;
      const learnerId = req.user.userId;

      const result = await classroomService.getLearnerOverdueAssignments(
        classroomId,
        learnerId
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error(
        `[getLearnerOverdueAssignments] Error loading overdue assignments for learner ${req.user?.userId} in classroom ${req.classroom?.id}:`,
        err
      );

      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to load overdue assignments.',
      });
    }
  }

  async getAssignmentDetails(req, res) {
    try {
      const classroomId = req.classroom.id;
      const assignmentId = req.params.assignmentId;

      const result = await classroomService.getAssignmentDetails(
        classroomId,
        assignmentId
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error(
        `[getAssignmentDetails] Error fetching details for assignment ${req.params?.assignmentId} in classroom ${req.classroom?.id}:`,
        err
      );
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to get assignment details.',
      });
    }
  }

  async changeAutoApproveSetting(req, res) {
    try {
      const classroomId = req.classroom.id;
      const { isAutoApprovalEnabled } = req.body;

      if (typeof isAutoApprovalEnabled !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'isAutoApprovalEnabled must be a boolean.',
        });
      }

      const updatedClassroom = await classroomService.changeAutoApproveSetting(
        classroomId,
        isAutoApprovalEnabled
      );

      return res.status(200).json({
        success: true,
        message: `Auto-approve setting has been ${isAutoApprovalEnabled ? 'enabled' : 'disabled'}.`,
        data: {
          classroomId: updatedClassroom.id,
          isAutoApprovalEnabled: updatedClassroom.is_auto_approval_enabled,
        },
      });
    } catch (error) {
      logger.error(
        `[changeAutoApproveSetting] Error updating auto-approve setting for classroom ${req.classroom?.id}:`,
        err
      );
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to update auto-approve setting.',
      });
    }
  }

  async deleteAssignment(req, res) {
    try {
      const classroomId = req.classroom.id;
      const assignmentId = req.params.assignmentId;
      const userId = req.user.userId;

      await classroomService.deleteAssignment(classroomId, assignmentId, userId);

      return res.status(200).json({
        success: true,
        message: 'Assignment deleted successfully.',
      });
    } catch (error) {
      logger.error(
        `[deleteAssignment] Error deleting assignment ${req.params?.assignmentId} in classroom ${req.classroom?.id} by user ${req.user?.userId}:`,
        err
      );
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete assignment.',
      });
    }
  }

  async leaveClassroom(req, res) {
    try {
      const classroomId = req.classroom.id;
      const learnerId = req.user.userId;

      await classroomService.leaveClassroom(classroomId, learnerId);

      return res.status(200).json({
        success: true,
        message: 'You have left the classroom.',
      });
    } catch (error) {
      logger.error(
        `[leaveClassroom] Error while learner ${req.user?.userId} trying to leave classroom ${req.classroom?.id}:`,
        err
      );
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to leave the classroom.',
      });
    }
  }
}

module.exports = new ClassroomController();
