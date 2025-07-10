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

    await classroomModel.createJoinRequest(classroom.id, user.userId, user.email);
  }

  async getPendingJoinRequests(classroomId) {
    return await classroomModel.getPendingJoinRequests(classroomId);
  }
}

module.exports = new ClassroomService();
