const classroomService = require('../services/classroom.service');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');
const { ResponseUtils, ErrorHandler } = require('../utils');

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

      return ResponseUtils.success(res, 'Classroom created successfully', newClassroom, 201);
    } catch (error) {
      return ErrorHandler.handleError(
        res,
        error,
        'createClassroom',
        'Failed to create classroom'
      );
    }
  }

  async getMyClassrooms(req, res) {
    try {
      const { userId } = req.user;

      const classrooms = await classroomService.getClassroomsByTeacherId(userId);

      return ResponseUtils.success(res, 'Classrooms retrieved successfully', classrooms);
    } catch (error) {
      return ErrorHandler.handleError(
        res,
        error,
        'getMyClassrooms',
        'Failed to get classrooms'
      );
    }
  }

  async requestJoinByCode(req, res) {
    try {
      const { joinCode } = req.body;
      const user = req.user;

      if (!joinCode) {
        return ResponseUtils.validationError(res, 'Join code is required.');
      }

      const result = await classroomService.handleJoinRequestByCode(joinCode, user);

      return ResponseUtils.success(
        res,
        result.autoApproved
          ? 'You have joined the classroom.'
          : 'Join request submitted. Please wait for approval.'
      );
    } catch (error) {
      return ErrorHandler.handleError(
        res,
        error,
        'requestJoinByCode',
        'Failed to request to join classroom'
      );
    }
  }

  async getPendingJoinRequests(req, res) {
    try {
      const classroomId = req.classroom.id;

      const pendingRequests =
        await classroomService.getPendingJoinRequests(classroomId);

      return ResponseUtils.success(res, 'Pending requests retrieved successfully', pendingRequests);
    } catch (error) {
      return ErrorHandler.handleError(
        res,
        error,
        'getPendingJoinRequests',
        'Failed to fetch join requests'
      );
    }
  }

  async approveJoinRequest(req, res) {
    try {
      const classroomId = req.classroom.id;
      const { learnerId } = req.body;

      if (!learnerId) {
        return ResponseUtils.validationError(res, 'Missing learnerId in request body.');
      }

      await classroomService.approveJoinRequest(classroomId, learnerId);

      return ResponseUtils.success(res, 'Join request approved.');
    } catch (error) {
      return ErrorHandler.handleError(
        res,
        error,
        'approveJoinRequest',
        'Failed to approve join request'
      );
    }
  }

  async rejectJoinRequest(req, res) {
    try {
      const classroomId = req.classroom.id;
      const { learnerId } = req.body;

      if (!learnerId) {
        return ResponseUtils.validationError(res, 'Missing learnerId in request body.');
      }

      await classroomService.rejectJoinRequest(classroomId, learnerId);

      return ResponseUtils.success(res, 'Join request rejected.');
    } catch (error) {
      return ErrorHandler.handleError(
        res,
        error,
        'rejectJoinRequest',
        'Failed to reject join request'
      );
    }
  }

  async approveAllJoinRequests(req, res) {
    try {
      const classroomId = req.classroom.id;

      const result = await classroomService.approveAllJoinRequests(classroomId);

      return ResponseUtils.success(res, `Approved ${result} learners.`);
    } catch (error) {
      return ErrorHandler.handleError(
        res,
        error,
        'approveAllJoinRequests',
        'Failed to approve join requests'
      );
    }
  }

  async getJoinedLearners(req, res) {
    try {
      const classroomId = req.classroom.id;

      const learners = await classroomService.getJoinedLearners(classroomId);

      return ResponseUtils.success(res, 'Learners retrieved successfully', learners);
    } catch (error) {
      return ErrorHandler.handleError(
        res,
        error,
        'getJoinedLearners',
        'Failed to fetch learner list'
      );
    }
  }

  async removeLearner(req, res) {
    try {
      const classroomId = req.classroom.id;
      const { learnerId } = req.body;

      if (!learnerId) {
        return ResponseUtils.validationError(res, 'Missing learnerId in request body.');
      }

      await classroomService.removeLearner(classroomId, learnerId);

      return ResponseUtils.success(res, 'Learner has been removed from the classroom.');
    } catch (error) {
      return ErrorHandler.handleError(
        res,
        error,
        'removeLearner',
        'Failed to remove learner'
      );
    }
  }

  async deleteClassroom(req, res) {
    try {
      const classroom = req.classroom;

      await classroomService.deleteClassroom(classroom);

      return ResponseUtils.success(res, 'Classroom has been deleted.');
    } catch (error) {
      return ErrorHandler.handleError(
        res,
        error,
        'deleteClassroom',
        'Failed to delete classroom'
      );
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

      return ResponseUtils.success(res, 'Search results retrieved successfully', results);
    } catch (error) {
      return ErrorHandler.handleError(
        res,
        error,
        'searchLearnersByDisplayName',
        'Failed to search learners'
      );
    }
  }

  async inviteLearner(req, res) {
    try {
      const classroomId = req.classroom.id;
      const { email } = req.body;

      if (!email) {
        return ResponseUtils.validationError(res, 'Missing email of learner.');
      }

      const result = await classroomService.inviteLearner(classroomId, email);

      return ResponseUtils.success(res, 'Invitation has been sent.');
    } catch (error) {
      return ErrorHandler.handleError(
        res,
        error,
        'inviteLearner',
        'Failed to send invitation'
      );
    }
  }

  async acceptInvitation(req, res) {
    try {
      const { token } = req.body;
      const user = req.user;

      if (!token) {
        return ResponseUtils.validationError(res, 'Missing invitation token.');
      }

      const result = await classroomService.acceptInvitation(token, user);

      return ResponseUtils.success(res, 'You have successfully joined the classroom.', result);
    } catch (error) {
      return ErrorHandler.handleError(
        res,
        error,
        'acceptInvitation',
        'Failed to accept invitation'
      );
    }
  }

  async cancelInvitation(req, res) {
    try {
      const classroomId = req.classroom.id;
      const { email } = req.body;

      if (!email) {
        return ResponseUtils.validationError(res, 'Missing email in request body.');
      }

      await classroomService.cancelInvitation(classroomId, email);

      return ResponseUtils.success(res, 'Invitation has been cancelled.');
    } catch (error) {
      return ErrorHandler.handleError(
        res,
        error,
        'cancelInvitation',
        'Failed to cancel invitation'
      );
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

      return ResponseUtils.success(res, 'Assignment created successfully.', assignment, 201);
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

      return ResponseUtils.success(res, 'Joined classrooms retrieved successfully', result);
    } catch (error) {
      return ErrorHandler.handleError(
        res,
        error,
        'getMyJoinedClassrooms',
        'Failed to get joined classrooms'
      );
    }
  }

  async getClassroomInvitations(req, res) {
    try {
      const classroomId = req.classroom.id;

      const invitations =
        await classroomService.getClassroomInvitations(classroomId);

      return ResponseUtils.success(res, 'Invitations retrieved successfully', invitations);
    } catch (error) {
      return ErrorHandler.handleError(
        res,
        error,
        'getClassroomInvitations',
        'Failed to get invitations'
      );
    }
  }

  async getClassroomAssignments(req, res) {
    try {
      const classroomId = req.classroom.id;

      const assignments =
        await classroomService.getClassroomAssignments(classroomId);

      return ResponseUtils.success(res, 'Assignments retrieved successfully', assignments);
    } catch (error) {
      return ErrorHandler.handleError(
        res,
        error,
        'getClassroomAssignments',
        'Failed to retrieve assignments'
      );
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

      return ResponseUtils.success(res, 'To-review assignments retrieved successfully', result);
    } catch (error) {
      return ErrorHandler.handleError(
        res,
        error,
        'getLearnerToReviewAssignments',
        'Failed to load assignments'
      );
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

      return ResponseUtils.success(res, 'Reviewed assignments retrieved successfully', result);
    } catch (error) {
      return ErrorHandler.handleError(
        res,
        error,
        'getLearnerReviewedAssignments',
        'Failed to load reviewed assignments'
      );
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

      return ResponseUtils.success(res, 'Overdue assignments retrieved successfully', result);
    } catch (error) {
      return ErrorHandler.handleError(
        res,
        error,
        'getLearnerOverdueAssignments',
        'Failed to load overdue assignments'
      );
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

      return ResponseUtils.success(res, 'Assignment details retrieved successfully', result);
    } catch (error) {
      return ErrorHandler.handleError(
        res,
        error,
        'getAssignmentDetails',
        'Failed to get assignment details'
      );
    }
  }

  async changeAutoApproveSetting(req, res) {
    try {
      const classroomId = req.classroom.id;
      const { isAutoApprovalEnabled } = req.body;

      if (typeof isAutoApprovalEnabled !== 'boolean') {
        return ResponseUtils.validationError(res, 'isAutoApprovalEnabled must be a boolean.');
      }

      const updatedClassroom = await classroomService.changeAutoApproveSetting(
        classroomId,
        isAutoApprovalEnabled
      );

      return ResponseUtils.success(
        res,
        `Auto-approve setting has been ${isAutoApprovalEnabled ? 'enabled' : 'disabled'}.`,
        {
          classroomId: updatedClassroom.id,
          isAutoApprovalEnabled: updatedClassroom.is_auto_approval_enabled,
        }
      );
    } catch (error) {
      return ErrorHandler.handleError(
        res,
        error,
        'changeAutoApproveSetting',
        'Failed to update auto-approve setting'
      );
    }
  }

  async deleteAssignment(req, res) {
    try {
      const classroomId = req.classroom.id;
      const assignmentId = req.params.assignmentId;
      const userId = req.user.userId;

      await classroomService.deleteAssignment(classroomId, assignmentId, userId);

      return ResponseUtils.success(res, 'Assignment deleted successfully.');
    } catch (error) {
      return ErrorHandler.handleError(
        res,
        error,
        'deleteAssignment',
        'Failed to delete assignment'
      );
    }
  }

  async leaveClassroom(req, res) {
    try {
      const classroomId = req.classroom.id;
      const learnerId = req.user.userId;

      await classroomService.leaveClassroom(classroomId, learnerId);

      return ResponseUtils.success(res, 'You have left the classroom.');
    } catch (error) {
      return ErrorHandler.handleError(
        res,
        error,
        'leaveClassroom',
        'Failed to leave the classroom'
      );
    }
  }
}

module.exports = new ClassroomController();
