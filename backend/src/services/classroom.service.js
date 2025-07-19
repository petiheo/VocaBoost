const classroomModel = require('../models/classroom.model');
const {
  generateUniqueJoinCode,
  computeAssignmentStatus,
} = require('../helpers/classroom.helper');
const ms = require('ms');
const emailService = require('../services/email.service');
const { generateInvitationToken } = require('../helpers/jwt.helper');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

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
    const classrooms = await classroomModel.findByTeacherId(teacherId);

    const updated = await Promise.all(
      classrooms.map(async (classroom) => {
        const assignments = await classroomModel.getAssignmentsByClassroom(
          classroom.id
        );
        const count = assignments.length;

        return {
          ...classroom,
          assignment_count: count,
        };
      })
    );

    return updated;
  }

  async handleJoinRequestByCode(joinCode, user) {
    const classroom = await classroomModel.getClassroomByCode(joinCode);

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

    const existingMember = await classroomModel.findMemberStatus(
      classroom.id,
      user.userId
    );
    if (existingMember) {
      if (existingMember.join_status === 'joined') {
        throw new Error('You are already a member of this classroom.');
      }
      if (existingMember.join_status === 'pending_request') {
        throw new Error('You have already requested to join.');
      }
    }

    if (classroom.learner_count >= classroom.capacity_limit) {
      throw new Error('This classroom is full.');
    }

    await classroomModel.createJoinRequest(
      classroom.id,
      user.userId,
      user.email
    );

    const isAuto = classroom.is_auto_approval_enabled;
    if (isAuto) {
      await classroomModel.updateLearnerStatus(classroom.id, user.userId, {
        join_status: 'joined',
        joined_at: new Date().toISOString(),
      });

      return { autoApproved: true };
    }

    return { autoApproved: false };
  }

  async getPendingJoinRequests(classroomId) {
    return await classroomModel.getPendingJoinRequests(classroomId);
  }

  async approveJoinRequest(classroomId, learnerId) {
    const learner = await classroomModel.findMemberStatus(
      classroomId,
      learnerId
    );
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
    const learner = await classroomModel.findMemberStatus(
      classroomId,
      learnerId
    );

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

    const pendingList =
      await classroomModel.getPendingJoinRequests(classroomId);

    for (const learner of pendingList.slice(0, availableSlots)) {
      await classroomModel.updateLearnerStatus(
        classroomId,
        learner.learner_id,
        {
          join_status: 'joined',
          joined_at: new Date().toISOString(),
        }
      );

      approvedCount++;
    }
    return approvedCount;
  }

  async getJoinedLearners(classroomId) {
    return await classroomModel.getJoinedLearners(classroomId);
  }

  async removeLearner(classroomId, learnerId) {
    const learner = await classroomModel.findMemberStatus(
      classroomId,
      learnerId
    );

    if (!learner) {
      throw new Error('Learner is not found in this classroom.');
    }

    if (learner.join_status !== 'joined') {
      throw new Error(
        'Cannot remove learner who is not currently in the class.'
      );
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

    // // Load thông tin giáo viên
    // const teacher = await userModel.findById(classroom.teacher_id);
    // if (!teacher) {
    //   throw new Error('Teacher not found.');
    // }

    // // Không cho mời chính mình
    // if (teacher.email.toLowerCase() === email.toLowerCase()) {
    //   throw new Error("You cannot invite yourself to your own classroom.");
    // }

    // Kiểm tra học sinh đã là thành viên chưa
    // const user = await userModel.findByEmail(email);
    // if (user) {
    //   const member = await classroomModel.findMemberStatus(classroomId, user.id);
    //   if (member?.join_status === 'joined') {
    //     throw new Error('This learner is already a member of the classroom.');
    //   }
    // }

    const token = generateInvitationToken({ classroomId, email });
    const expiresAt = new Date(Date.now() + ms('7d')).toISOString();

    await classroomModel.upsertInvitation({
      classroom_id: classroomId,
      email,
      token,
      expires_at: expiresAt,
    });

    await emailService.sendClassInvitation(email, token, classroom);
  }

  async acceptInvitation(token, user) {
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      throw new Error('Invalid or expired invitation token.');
    }

    if (decoded.type !== 'classroom_invitation') {
      throw new Error('Invalid invitation token type.');
    }

    const classroomId = decoded.classroomId;
    const invitedEmail = decoded.email;

    const invitation = await classroomModel.getInvitationByToken(token);
    const classroom = await classroomModel.getClassroomById(
      invitation.classroom_id
    );

    if (invitedEmail !== user.email || classroomId !== classroom.id) {
      throw new Error('This invitation was not sent to your account.');
    }

    if (!invitation) {
      throw new Error('Invalid or expired invitation link.');
    }

    if (invitation.status === 'rejected') {
      // cancelled
      throw new Error('This invitation has been cancelled.');
    }

    if (invitation.used_at) {
      throw new Error('This invitation has already been used.');
    }

    if (new Date(invitation.expires_at) < new Date()) {
      throw new Error('This invitation has expired.');
    }

    if (classroom.learner_count >= classroom.capacity_limit) {
      throw new Error('This classroom is full.');
    }

    const member = await classroomModel.findMemberStatus(
      classroom.id,
      user.userId
    );
    if (member?.join_status === 'joined') {
      throw new Error('You are already a member of this classroom.');
    }

    await classroomModel.addLearnerToClass(
      classroom.id,
      user.userId,
      user.email
    );
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

  async createAssignment({
    classroomId,
    teacherId,
    vocabListId,
    title,
    exerciseMethod,
    wordsPerReview,
    startDate,
    dueDate,
  }) {
    if (wordsPerReview < 5 || wordsPerReview > 30) {
      throw new Error('wordsPerReview must be between 5 and 30.');
    }

    const allWords = await classroomModel.getWordsByListId(vocabListId); // vocabModel
    if (!allWords || allWords.length === 0) {
      throw new Error('Vocabulary list not found or empty.');
    }

    const sublistCount = Math.ceil(allWords.length / wordsPerReview);

    const assignment = await classroomModel.createAssignment({
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

    const assignmentId = assignment.id;

    for (let i = 0; i < sublistCount; i++) {
      const start = i * wordsPerReview;
      const end = (i + 1) * wordsPerReview;
      const subWords = allWords.slice(start, end);

      const clonedListId = await classroomModel.cloneListWithWords({
        // vocabModel
        originalListId: vocabListId,
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

    return assignment;
  }

  async getJoinedClassroomsByLearner(learnerId) {
    const classrooms =
      await classroomModel.getJoinedClassroomsByLearner(learnerId);

    const result = [];

    for (const classroom of classrooms) {
      const assignments = await classroomModel.getAssignmentsByClassroom(
        classroom.id
      );

      const assignedCount = assignments.filter(
        (a) => computeAssignmentStatus(a.start_date, a.due_date) === 'assigned'
      ).length;

      result.push({
        ...classroom,
        assignment_count: assignedCount,
      });
    }

    return result;
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

    for (const assignment of assignedAssignments) {
      const hasRecord = await classroomModel.hasLearnerAssignment(
        assignment.id,
        learnerId
      );
      if (!hasRecord) {
        await classroomModel.createLearnerAssignment({
          assignment_id: assignment.id,
          learner_id: learnerId,
        });
      }
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
    const reviewedCount =
      await classroomModel.countLearnersCompleted(assignmentId);

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
}

module.exports = new ClassroomService();
