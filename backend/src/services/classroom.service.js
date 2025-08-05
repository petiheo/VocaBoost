const classroomModel = require('../models/classroom.model');
const {
  generateUniqueJoinCode,
  computeAssignmentStatus,
} = require('../helpers/classroom.helper');
const ms = require('ms');
const emailService = require('../services/email.service');
const { generateInvitationToken, verifyToken } = require('../helpers/jwt.helper');
class ClassroomService {
  async createClassroom({
    name,
    description,
    teacher_id,
    classroom_status,
    capacity_limit,
  }) {
    const join_code = await generateUniqueJoinCode();

    const newClassroom = await classroomModel.createClassroom({
      name,
      description,
      teacher_id,
      join_code,
      classroom_status,
      capacity_limit,
    });

    return newClassroom;
  }

  async getClassroomsByTeacherId(teacherId) {
    return await classroomModel.findByTeacherIdWithAssignmentCounts(teacherId);
  }

  _validateClassroomForJoin(classroom, user) {
    if (!classroom || classroom.classroom_status === 'deleted') {
      throw new Error('Classroom not found or has been deleted.');
    }

    if (classroom.classroom_status === 'private') {
      throw new Error(
        'This classroom is private. You must be invited by the teacher.'
      );
    }

    if (classroom.teacher_id === user.userId) {
      throw new Error('You are the owner of this classroom.');
    }
  }

  _validateExistingMembership(existingMember) {
    if (existingMember) {
      if (existingMember.join_status === 'joined') {
        throw new Error('You are already a member of this classroom.');
      }
      if (existingMember.join_status === 'pending_request') {
        throw new Error('You have already requested to join.');
      }
    }
  }

  _validateClassroomCapacity(classroom) {
    if (classroom.learner_count >= classroom.capacity_limit) {
      throw new Error('This classroom is full.');
    }
  }

  async _processAutoApproval(classroom, user) {
    if (classroom.is_auto_approval_enabled) {
      await classroomModel.updateLearnerStatus(classroom.id, user.userId, {
        join_status: 'joined',
        joined_at: new Date().toISOString(),
      });
      return { autoApproved: true };
    }
    return { autoApproved: false };
  }

  async handleJoinRequestByCode(joinCode, user) {
    const classroom = await classroomModel.getClassroomByCode(joinCode);

    this._validateClassroomForJoin(classroom, user);

    const existingMember = await classroomModel.findMemberStatus(
      classroom.id,
      user.userId
    );
    this._validateExistingMembership(existingMember);
    this._validateClassroomCapacity(classroom);

    await classroomModel.createJoinRequest(classroom.id, user.userId, user.email);

    return await this._processAutoApproval(classroom, user);
  }

  async getPendingJoinRequests(classroomId) {
    return await classroomModel.getPendingJoinRequests(classroomId);
  }

  async approveJoinRequest(classroomId, learnerId) {
    const learner = await classroomModel.findMemberStatus(classroomId, learnerId);
    const classroom = await classroomModel.getClassroomById(classroomId);

    if (!learner) {
      throw new Error('Learner is not part of this classroom.');
    }

    if (learner.join_status !== 'pending_request') {
      throw new Error('Learner is not in pending request state.');
    }

    if (classroom.learner_count >= classroom.capacity_limit) {
      throw new Error('Classroom is full. Cannot approve more learners.');
    }

    await classroomModel.updateLearnerStatus(classroom.id, learnerId, {
      join_status: 'joined',
      joined_at: new Date().toISOString(),
    });
  }

  async rejectJoinRequest(classroomId, learnerId) {
    const learner = await classroomModel.findMemberStatus(classroomId, learnerId);

    if (!learner) {
      throw new Error('Learner is not part of this classroom.');
    }

    if (learner.join_status !== 'pending_request') {
      throw new Error('Learner is not in pending request state.');
    }

    await classroomModel.updateLearnerStatus(classroomId, learnerId, {
      join_status: 'rejected',
    });
  }

  async approveAllJoinRequests(classroomId) {
    const classroom = await classroomModel.getClassroomById(classroomId);
    const currentCount = classroom.learner_count;
    const availableSlots = classroom.capacity_limit - currentCount;
    let approvedCount = 0;

    const pendingList = await classroomModel.getPendingJoinRequests(classroomId);

    for (const learner of pendingList.slice(0, availableSlots)) {
      await classroomModel.updateLearnerStatus(classroomId, learner.learner_id, {
        join_status: 'joined',
        joined_at: new Date().toISOString(),
      });

      approvedCount++;
    }
    return approvedCount;
  }

  async getJoinedLearners(classroomId) {
    return await classroomModel.getJoinedLearners(classroomId);
  }

  async removeLearner(classroomId, learnerId) {
    const learner = await classroomModel.findMemberStatus(classroomId, learnerId);

    if (!learner) {
      throw new Error('Learner is not found in this classroom.');
    }

    if (learner.join_status !== 'joined') {
      throw new Error('Cannot remove learner who is not currently in the class.');
    }

    await classroomModel.updateLearnerStatus(classroomId, learnerId, {
      join_status: 'rejected',
      left_at: new Date().toISOString(),
    });
  }

  async deleteClassroom(classroom) {
    if (classroom.classroom_status === 'deleted') {
      throw new Error('This classroom has already been deleted.');
    }

    await classroomModel.softDeleteClassroom(classroom.id);
  }

  async searchLearnersByDisplayName(classroomId, status, keyword) {
    if (!status) {
      throw new Error('Missing required parameter: status');
    }

    return await classroomModel.searchLearnersByDisplayName(
      classroomId,
      status,
      keyword
    );
  }

  async inviteLearner(classroomId, email) {
    const classroom = await classroomModel.getClassroomById(classroomId);

    const teacher = await classroomModel.findById(classroom.teacher_id);
    if (!teacher) {
      throw new Error('Teacher not found.');
    }

    if (teacher.email.toLowerCase() === email.toLowerCase()) {
      throw new Error('You cannot invite yourself to your own classroom.');
    }

    const learner = await classroomModel.findByEmail(email);
    if (learner) {
      const member = await classroomModel.findMemberStatus(classroomId, learner.id);
      if (member?.join_status === 'joined') {
        throw new Error('This learner is already a member of the classroom.');
      }
    }

    const token = generateInvitationToken({ classroomId, email });
    const expiresAt = new Date(Date.now() + ms('7d')).toISOString();

    await classroomModel.upsertInvitation({
      classroom_id: classroomId,
      email,
      token,
      expires_at: expiresAt,
    });

    await emailService.sendClassInvitation(
      email,
      token,
      classroom,
      teacher.display_name
    );
  }

  _verifyInvitationToken(token) {
    try {
      const decoded = verifyToken(token);
      if (decoded.type !== 'classroom_invitation') {
        throw new Error('Invalid invitation token type.');
      }
      return decoded;
    } catch (err) {
      throw new Error('Invalid or expired invitation token.');
    }
  }

  _validateInvitationAccess(decoded, user, classroom) {
    if (decoded.email !== user.email || decoded.classroomId !== classroom.id) {
      throw new Error('This invitation was not sent to your account.');
    }
  }

  _validateInvitationStatus(invitation) {
    if (!invitation) {
      throw new Error('Invalid or expired invitation link.');
    }

    if (invitation.status === 'rejected') {
      throw new Error('This invitation has been cancelled.');
    }

    if (invitation.used_at) {
      throw new Error('This invitation has already been used.');
    }

    if (new Date(invitation.expires_at) < new Date()) {
      throw new Error('This invitation has expired.');
    }
  }

  async _validateInvitationConstraints(classroom, user) {
    if (classroom.learner_count >= classroom.capacity_limit) {
      throw new Error('This classroom is full.');
    }

    const member = await classroomModel.findMemberStatus(classroom.id, user.userId);
    if (member?.join_status === 'joined') {
      throw new Error('You are already a member of this classroom.');
    }
  }

  async acceptInvitation(token, user) {
    const decoded = this._verifyInvitationToken(token);

    const invitation = await classroomModel.getInvitationByToken(token);
    const classroom = await classroomModel.getClassroomById(invitation.classroom_id);

    this._validateInvitationAccess(decoded, user, classroom);
    this._validateInvitationStatus(invitation);
    await this._validateInvitationConstraints(classroom, user);

    await classroomModel.addLearnerToClass(classroom.id, user.userId, user.email);
    await classroomModel.updateInvitationStatus(invitation.id, 'joined');

    return { classroomId: classroom.id };
  }

  async cancelInvitation(classroomId, email) {
    const invitation = await classroomModel.findInvitation(classroomId, email);
    if (!invitation) {
      throw new Error('Invitation not found.');
    }

    if (invitation.status !== 'pending_invite' || invitation.used_at) {
      throw new Error(
        'This invitation has already been accepted and cannot be cancelled.'
      );
    }
    await classroomModel.cancelInvitation(classroomId, email);
  }

  _validateAssignmentData(assignmentData) {
    const { wordsPerReview } = assignmentData;
    if (wordsPerReview < 5 || wordsPerReview > 30) {
      throw new Error('wordsPerReview must be between 5 and 30.');
    }
  }

  async _getAndValidateWords(vocabListId) {
    const allWords = await classroomModel.getWordsByListId(vocabListId);
    if (!allWords || allWords.length === 0) {
      throw new Error('Vocabulary list not found or empty.');
    }
    return allWords;
  }

  async _createAssignmentRecord(assignmentData, sublistCount) {
    const {
      classroomId,
      teacherId,
      vocabListId,
      title,
      exerciseMethod,
      wordsPerReview,
      startDate,
      dueDate,
    } = assignmentData;

    return await classroomModel.createAssignment({
      classroom_id: classroomId,
      vocab_list_id: vocabListId,
      teacher_id: teacherId,
      title,
      exercise_method: exerciseMethod,
      words_per_review: wordsPerReview,
      sublist_count: sublistCount,
      start_date: startDate,
      due_date: dueDate,
    });
  }

  async _generateAssignmentSublists(assignmentId, allWords, assignmentData) {
    const { wordsPerReview, teacherId, title } = assignmentData;
    const sublistCount = Math.ceil(allWords.length / wordsPerReview);

    for (let i = 0; i < sublistCount; i++) {
      const start = i * wordsPerReview;
      const end = (i + 1) * wordsPerReview;
      const subWords = allWords.slice(start, end);

      const clonedListId = await classroomModel.cloneListWithWords({
        originalListId: assignmentData.vocabListId,
        creatorId: teacherId,
        title: `${title} - Sublist ${i + 1}`,
        words: subWords,
      });

      await classroomModel.createAssignmentSublist({
        assignment_id: assignmentId,
        sublist_index: i + 1,
        vocab_list_id: clonedListId,
      });
    }
  }

  async createAssignment(assignmentData) {
    this._validateAssignmentData(assignmentData);

    const allWords = await this._getAndValidateWords(assignmentData.vocabListId);
    const sublistCount = Math.ceil(allWords.length / assignmentData.wordsPerReview);

    const assignment = await this._createAssignmentRecord(
      assignmentData,
      sublistCount
    );
    await this._generateAssignmentSublists(assignment.id, allWords, assignmentData);

    return assignment;
  }

  async getJoinedClassroomsByLearner(learnerId) {
    return await classroomModel.getJoinedClassroomsByLearnerWithAssignmentCounts(
      learnerId
    );
  }

  async getClassroomInvitations(classroomId) {
    return await classroomModel.getInvitationsByClassroomId(classroomId);
  }

  async getClassroomAssignments(classroomId) {
    const raw = await classroomModel.getAssignmentsByClassroom(classroomId);

    return raw.map((a) => ({
      ...a,
      status: computeAssignmentStatus(a.start_date, a.due_date),
    }));
  }

  async getLearnerToReviewAssignments(classroomId, learnerId) {
    const allAssignments =
      await classroomModel.getAssignmentsByClassroom(classroomId);
    const assignedAssignments = allAssignments.filter(
      (a) => computeAssignmentStatus(a.start_date, a.due_date) === 'assigned'
    );

    const existingAssignmentIds =
      await classroomModel.getLearnerAssignmentsByClassroomAndLearner(
        classroomId,
        learnerId
      );

    const missingAssignments = assignedAssignments
      .filter((assignment) => !existingAssignmentIds.includes(assignment.id))
      .map((assignment) => ({
        assignment_id: assignment.id,
        learner_id: learnerId,
      }));

    if (missingAssignments.length > 0) {
      await classroomModel.createLearnerAssignmentsBatch(missingAssignments);
    }

    const raw = await classroomModel.getLearnerAssignmentsByStatus(
      classroomId,
      learnerId,
      ['not_started', 'in_progress']
    );

    const result = raw.filter(
      (item) =>
        computeAssignmentStatus(
          item.assignments.start_date,
          item.assignments.due_date
        ) === 'assigned'
    );

    return result.map((item) => ({
      assignment_id: item.assignment_id,
      title: item.assignments.title,
      exercise_method: item.assignments.exercise_method,
      completed_sublist_index: item.completed_sublist_index,
      sublist_count: item.assignments.sublist_count,
      due_date: item.assignments.due_date,
      status: 'assigned',
      learner_status: item.status,
      creator: item.assignments.vocab_lists.creator,
    }));
  }

  async getLearnerReviewedAssignments(classroomId, learnerId) {
    const raw = await classroomModel.getLearnerAssignmentsByStatus(
      classroomId,
      learnerId,
      ['completed']
    );
    
    return raw.map((item) => ({
      assignment_id: item.assignment_id,
      title: item.assignments.title,
      exercise_method: item.assignments.exercise_method,
      completed_sublist_index: item.completed_sublist_index,
      sublist_count: item.assignments.sublist_count,
      due_date: item.assignments.due_date,
      learner_status: item.status,
      creator: item.assignments.vocab_lists.creator,
    }));
  }

  async getLearnerOverdueAssignments(classroomId, learnerId) {
    const raw = await classroomModel.getLearnerAssignmentsByStatus(
      classroomId,
      learnerId,
      ['not_started', 'in_progress', 'late', 'interrupted']
    );

    return raw
      .filter((item) => {
        const status = computeAssignmentStatus(
          item.assignments.start_date,
          item.assignments.due_date
        );
        return status === 'overdue';
      })
      .map((item) => ({
        assignment_id: item.assignment_id,
        title: item.assignments.title,
        exercise_method: item.assignments.exercise_method,
        completed_sublist_index: item.completed_sublist_index,
        sublist_count: item.assignments.sublist_count,
        due_date: item.assignments.due_date,
        status: 'overdue',
        learner_status: item.status,
        creator:item.assignments.vocab_lists.creator,
      }));
  }

  async getAssignmentDetails(classroomId, assignmentId) {
    const assignment = await classroomModel.getAssignmentById(
      classroomId,
      assignmentId
    );
    if (!assignment) {
      throw new Error('Assignment not found.');
    }

    const allWords = await classroomModel.getAssignmentVocabulary(
      assignment.vocab_list_id
    );
    const reviewedCount = await classroomModel.countLearnersCompleted(assignmentId);

    return {
      title: assignment.title,
      start_date: assignment.start_date,
      due_date: assignment.due_date,
      total_words: allWords.length,
      reviewed_learner_count: reviewedCount,
      vocabulary: allWords,
    };
  }

  async changeAutoApproveSetting(classroomId, enabled) {
    return await classroomModel.updateAutoApproval(classroomId, enabled);
  }

  async deleteAssignment(classroomId, assignmentId) {
    const assignment = await classroomModel.getAssignmentById(
      classroomId,
      assignmentId
    );

    if (!assignment) {
      throw new Error('Assignment not found.');
    }

    const subLists = await classroomModel.getAssignmentSublists(assignmentId);
    const vocabListIds = subLists.map((sub) => sub.vocab_list_id);

    if (vocabListIds.length > 0) {
      await classroomModel.deleteVocabLists(vocabListIds);
    }

    await classroomModel.deleteAssignmentSublists(assignmentId);
    await classroomModel.deleteLearnerAssignmentsByAssignmentId(assignmentId);
    await classroomModel.deleteAssignmentRecord(assignmentId);
  }

  async leaveClassroom(classroomId, learnerId) {
    await classroomModel.updateLearnerStatus(classroomId, learnerId, {
      join_status: 'rejected',
      left_at: new Date().toISOString(),
    });

    await classroomModel.deleteLearnerAssignmentsByLearnerId(learnerId);
  }
}

module.exports = new ClassroomService();
