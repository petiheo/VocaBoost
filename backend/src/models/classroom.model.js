const { supabase } = require('../config/supabase.config');
const { v4: uuidv4 } = require('uuid');

class ClassroomModel {
  async createClassroom({
    name,
    description,
    teacher_id,
    join_code,
    classroom_status,
    capacity_limit,
  }) {
    const { data, error } = await supabase
      .from('classrooms')
      .insert({
        name,
        description,
        teacher_id,
        join_code,
        classroom_status,
        capacity_limit,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async isJoinCodeUnique(code) {
    const { data, error } = await supabase
      .from('classrooms')
      .select('id')
      .eq('join_code', code)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  }

  async findByTeacherId(teacherId) {
    const { data, error } = await supabase
      .from('classrooms')
      .select('*')
      .eq('teacher_id', teacherId)
      .neq('classroom_status', 'deleted');

    if (error) throw error;
    return data;
  }

  async findByTeacherIdWithAssignmentCounts(teacherId) {
    const { data, error } = await supabase
      .from('classrooms')
      .select(
        `
        *,
        assignments(id)
      `
      )
      .eq('teacher_id', teacherId)
      .neq('classroom_status', 'deleted');

    if (error) throw error;

    return data.map((classroom) => ({
      ...classroom,
      assignment_count: classroom.assignments ? classroom.assignments.length : 0,
      assignments: undefined,
    }));
  }

  async getClassroomByCode(joinCode) {
    const { data, error } = await supabase
      .from('classrooms')
      .select('*')
      .eq('join_code', joinCode)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getClassroomCount(teacherId) {
    const { count, error } = await supabase
      .from('classrooms')
      .select('*', { count: 'exact', head: true })
      .eq('teacher_id', teacherId)
      .neq('classroom_status', 'deleted');

    if (error) throw error;
    return count || 0;
  }

  async findMemberStatus(classroomId, userId) {
    const { data, error } = await supabase
      .from('classroom_members')
      .select('join_status')
      .eq('classroom_id', classroomId)
      .eq('learner_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async createJoinRequest(classroomId, learnerId, email) {
    const { error } = await supabase.from('classroom_members').upsert({
      classroom_id: classroomId,
      learner_id: learnerId,
      email,
      join_status: 'pending_request',
    });

    if (error) throw error;
  }

  async getClassroomById(classroomId) {
    const { data, error } = await supabase
      .from('classrooms')
      .select('*')
      .eq('id', classroomId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async isJoinedLearner(classroomId, userId) {
    const { data, error } = await supabase
      .from('classroom_members')
      .select('join_status')
      .eq('classroom_id', classroomId)
      .eq('learner_id', userId)
      .eq('join_status', 'joined')
      .maybeSingle();

    if (error) throw error;
    return !!data;
  }

  async getPendingJoinRequests(classroomId) {
    const { data, error } = await supabase
      .from('classroom_members')
      .select(
        `
            learner_id,
            email,
            join_status,
            joined_at,
            users (
                display_name,
                avatar_url
            )
            `
      )
      .eq('classroom_id', classroomId)
      .eq('join_status', 'pending_request');

    if (error) throw error;
    return data;
  }

  async updateLearnerStatus(classroomId, learnerId, fields) {
    const { error } = await supabase
      .from('classroom_members')
      .update(fields)
      .eq('classroom_id', classroomId)
      .eq('learner_id', learnerId);

    if (error) throw error;
  }

  async approveAllPendingRequests(classroomId) {
    const now = new Date().toISOString();

    const { error } = await supabase
      .from('classroom_members')
      .update({
        join_status: 'joined',
        joined_at: now,
      })
      .eq('classroom_id', classroomId)
      .eq('join_status', 'pending_request');

    if (error) throw error;
  }

  async getJoinedLearners(classroomId) {
    const { data, error } = await supabase
      .from('classroom_members')
      .select(
        `
            learner_id,
            email,
            joined_at,
            users (
                display_name,
                avatar_url
            )
            `
      )
      .eq('classroom_id', classroomId)
      .eq('join_status', 'joined');

    if (error) throw error;
    return data;
  }

  async softDeleteClassroom(classroomId) {
    const { error } = await supabase
      .from('classrooms')
      .update({ classroom_status: 'deleted' })
      .eq('id', classroomId);

    if (error) throw error;
  }

  async searchLearnersByDisplayName(classroomId, status, keyword) {
    let query = supabase
      .from('classroom_members')
      .select(
        `
            learner_id,
            email,
            join_status,
            users (
                display_name,
                avatar_url
            )
            `
      )
      .eq('classroom_id', classroomId)
      .eq('join_status', status);

    if (keyword) {
      query = query.ilike('users.display_name', `%${keyword}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }

  async upsertInvitation({ classroom_id, email, token, expires_at }) {
    const { data, error } = await supabase
      .from('classroom_invitations')
      .upsert(
        {
          classroom_id,
          email,
          token,
          expires_at,
          status: 'pending_invite',
          used_at: null,
        },
        { onConflict: 'classroom_id,email' }
      )
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getInvitationByToken(token) {
    const { data, error } = await supabase
      .from('classroom_invitations')
      .select('*')
      .eq('token', token)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async updateInvitationStatus(invitationId, status) {
    const { error } = await supabase
      .from('classroom_invitations')
      .update({
        used_at: new Date().toISOString(),
        status,
      })
      .eq('id', invitationId);
    if (error) throw error;
  }

  async addLearnerToClass(classroomId, learnerId, email) {
    const { error } = await supabase.from('classroom_members').upsert(
      {
        classroom_id: classroomId,
        learner_id: learnerId,
        email,
        join_status: 'joined',
        joined_at: new Date().toISOString(),
      },
      { onConflict: 'classroom_id,learner_id' }
    );
    if (error) throw error;
  }

  async findInvitation(classroomId, email) {
    const { data, error } = await supabase
      .from('classroom_invitations')
      .select('*')
      .eq('classroom_id', classroomId)
      .eq('email', email)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async cancelInvitation(classroomId, email) {
    const { error } = await supabase
      .from('classroom_invitations')
      .update({ status: 'rejected' }) // cancelled
      .eq('classroom_id', classroomId)
      .eq('email', email);
    if (error) throw error;
  }

  async createAssignment(data) {
    const { data: result, error } = await supabase
      .from('assignments')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return result;
  }

  async createAssignmentSublist(data) {
    const { error } = await supabase.from('assignment_sublists').insert(data);
    if (error) throw error;
  }

  async getJoinedClassroomsByLearner(learnerId) {
    const { data, error } = await supabase
      .from('classroom_members')
      .select(
        `
            classroom_id,
            classrooms (
                id,
                teacher_id,
                name,
                description,
                join_code,
                learner_count,
                classroom_status
            )
            `
      )
      .eq('learner_id', learnerId)
      .eq('join_status', 'joined');

    if (error) throw error;

    return data.map((entry) => ({
      id: entry.classrooms.id,
      teacher_id: entry.classrooms.teacher_id,
      name: entry.classrooms.name,
      description: entry.classrooms.description,
      join_code: entry.classrooms.join_code,
      learner_count: entry.classrooms.learner_count,
      status: entry.classrooms.classroom_status,
    }));
  }

  async getJoinedClassroomsByLearnerWithAssignmentCounts(learnerId) {
    const { data, error } = await supabase
      .from('classroom_members')
      .select(
        `
            classroom_id,
            classrooms (
                id,
                teacher_id,
                name,
                description,
                join_code,
                learner_count,
                classroom_status,
                assignments(
                  id,
                  start_date,
                  due_date
                )
            )
            `
      )
      .eq('learner_id', learnerId)
      .eq('join_status', 'joined');

    if (error) throw error;

    return data.map((entry) => {
      const assignments = entry.classrooms.assignments || [];
      const now = new Date();

      const assignedCount = assignments.filter((assignment) => {
        const startDate = new Date(assignment.start_date);
        const dueDate = new Date(assignment.due_date);
        return startDate <= now && now <= dueDate;
      }).length;

      return {
        id: entry.classrooms.id,
        teacher_id: entry.classrooms.teacher_id,
        name: entry.classrooms.name,
        description: entry.classrooms.description,
        join_code: entry.classrooms.join_code,
        learner_count: entry.classrooms.learner_count,
        status: entry.classrooms.classroom_status,
        assignment_count: assignedCount,
      };
    });
  }

  async getInvitationsByClassroomId(classroomId) {
    const { data, error } = await supabase
      .from('classroom_invitations')
      .select('email')
      .eq('classroom_id', classroomId)
      .eq('status', 'pending_invite');
    if (error) throw error;
    return data;
  }

  async getLearnerAssignmentsByClassroomAndLearner(classroomId, learnerId) {
    const { data, error } = await supabase.rpc(
      'get_learner_assignments_by_classroom',
      {
        p_classroom_id: classroomId,
        p_learner_id: learnerId,
      }
    );

    if (error) throw error;
    return data ? data.map((row) => row.assignment_id) : [];
  }

  async createLearnerAssignmentsBatch(assignments) {
    const { data, error } = await supabase
      .from('learner_assignments')
      .insert(assignments)
      .select();

    if (error) throw error;
    return data;
  }

  async getAssignmentsByClassroom(classroomId) {
    const { data, error } = await supabase
      .from('assignments')
      .select(
        `
            id,
            title,
            exercise_method,
            start_date,
            due_date,
            words_per_review,
            sublist_count,
            created_at,
            updated_at,
            vocab_lists (
              creator:users (
                  email,
                  avatar_url,
                  display_name
              )
            )
            `
      )
      .eq('classroom_id', classroomId)
      .order('start_date', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getLearnerAssignmentsByStatus(classroomId, learnerId, statusList) {
    const { data, error } = await supabase
      .from('learner_assignments')
      .select(
        `
            assignment_id,
            completed_sublist_index,
            status,
            assignments (
                title,
                exercise_method,
                sublist_count,
                due_date,
                start_date,
                classroom_id,
                vocab_lists (
                  creator:users (
                      email,
                      avatar_url,
                      display_name
                  )
                )
            )
            `
      )
      .eq('learner_id', learnerId)
      .in('status', statusList);

    if (error) throw error;
    return data.filter((item) => item.assignments?.classroom_id === classroomId);
  }

  async hasLearnerAssignment(assignmentId, learnerId) {
    const { data, error } = await supabase
      .from('learner_assignments')
      .select('assignment_id')
      .eq('assignment_id', assignmentId)
      .eq('learner_id', learnerId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  }

  async createLearnerAssignment({ assignment_id, learner_id }) {
    const { error } = await supabase.from('learner_assignments').insert({
      assignment_id,
      learner_id,
      status: 'not_started',
      completed_sublist_index: 0,
    });

    if (error) throw error;
  }

  async getAssignmentById(classroomId, assignmentId) {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('id', assignmentId)
      .eq('classroom_id', classroomId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getAssignmentVocabulary(vocabListId) {
    const { data, error } = await supabase
      .from('vocabulary')
      .select('term, definition')
      .eq('list_id', vocabListId);

    if (error) throw error;
    return data;
  }

  async countLearnersCompleted(assignmentId) {
    const { count, error } = await supabase
      .from('learner_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('assignment_id', assignmentId)
      .eq('status', 'completed');

    if (error) throw error;
    return count;
  }

  async updateAutoApproval(classroomId, value) {
    const { data, error } = await supabase
      .from('classrooms')
      .update({ is_auto_approval_enabled: value })
      .eq('id', classroomId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getAssignmentSublists(assignmentId) {
    const { data, error } = await supabase
      .from('assignment_sublists')
      .select('*')
      .eq('assignment_id', assignmentId);

    if (error) throw error;
    return data;
  }

  async deleteAssignmentSublists(assignmentId) {
    const { error } = await supabase
      .from('assignment_sublists')
      .delete()
      .eq('assignment_id', assignmentId);

    if (error) throw error;
  }

  async deleteLearnerAssignmentsByAssignmentId(assignmentId) {
    const { error } = await supabase
      .from('learner_assignments')
      .delete()
      .eq('assignment_id', assignmentId);

    if (error) throw error;
  }

  async deleteLearnerAssignmentsByLearnerId(learnerId) {
    const { error } = await supabase
      .from('learner_assignments')
      .delete()
      .eq('learner_id', learnerId);

    if (error) throw error;
  }

  async deleteAssignmentRecord(assignmentId) {
    const { error } = await supabase
      .from('assignments')
      .delete()
      .eq('id', assignmentId);

    if (error) throw error;
  }

  // =================
  //    vocab model
  // =================
  async getWordsByListId(listId) {
    const { data, error } = await supabase
      .from('vocabulary')
      .select('*')
      .eq('list_id', listId);
    if (error) throw error;
    return data;
  }

  async cloneListWithWords({ originalListId, creatorId, title, words }) {
    const newListId = uuidv4();

    await supabase.from('vocab_lists').insert({
      id: newListId,
      creator_id: creatorId,
      title,
      description: `Cloned from list ${originalListId}`,
      word_count: words.length,
      privacy_setting: 'private',
      is_active: true,
    });

    // Clone từng từ
    const clonedWords = words.map((w) => ({
      id: uuidv4(),
      list_id: newListId,
      created_by: creatorId,
      term: w.term,
      definition: w.definition,
      phonetics: w.phonetics || null,
      image_url: w.image_url || null,
    }));

    const { error } = await supabase.from('vocabulary').insert(clonedWords);
    if (error) throw error;

    return newListId;
  }

  async deleteVocabLists(listIds) {
    const { error } = await supabase.from('vocab_lists').delete().in('id', listIds);

    if (error) throw error;
  }
}

module.exports = new ClassroomModel();
