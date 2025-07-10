const classroomModel = require('../models/classroom.model');
const { generateUniqueJoinCode } = require('../helpers/joinCode.helper');

class ClassroomService {
  async createClassroom({ name, description, teacher_id, classroom_status, capacity_limit }) {
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
    return await classroomModel.findByTeacherId(teacherId);
  }

  async handleJoinRequestByCode(joinCode, user) {
    const classroom = await classroomModel.getClassroomByCode(joinCode);

    if (!classroom || classroom.classroom_status === 'deleted') {
      throw new Error('Classroom not found or has been deleted.');
    }

    if (classroom.classroom_status === 'private') {
      throw new Error('This classroom is private. You must be invited by the teacher.');
    }

    if (classroom.teacher_id === user.userId) {
      throw new Error('You are the owner of this classroom.');
    }

    const existingMember = await classroomModel.findMemberStatus(classroom.id, user.userId);
    if (existingMember) {
      if (existingMember.join_status === 'joined') {
        throw new Error('You are already a member of this classroom.');
      }
      if (existingMember.join_status === 'pending_request') {
        throw new Error('You have already requested to join.');
      }
    }

    if (classroom.learner_count >= classroom.capacity_limit) {
        throw new Error('This classroom has reached its capacity limit.');
    }

    await classroomModel.createJoinRequest(classroom.id, user.userId, user.email);

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
        joined_at: new Date().toISOString()
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
      left_at: new Date().toISOString()
    });
  }
}

module.exports = new ClassroomService();
