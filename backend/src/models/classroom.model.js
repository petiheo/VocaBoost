const supabase = require('../config/database');

class ClassroomModel {
    async createClassroom({ name, description, teacher_id, join_code, classroom_status, capacity_limit }) {
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
            .eq('teacher_id', teacherId);

        if (error) throw error;
        return data;
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
        const { error } = await supabase
            .from('classroom_members')
            .upsert({
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
            .select(`
            learner_id,
            email,
            join_status,
            joined_at,
            users (
                display_name,
                avatar_url
            )
            `)
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
            .select(`
            learner_id,
            email,
            joined_at,
            users (
                display_name,
                avatar_url
            )
            `)
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
        const { data, error } = await supabase
            .from('classroom_members')
            .select(`
            learner_id,
            email,
            join_status,
            users (
                display_name,
                avatar_url
            )
            `)
            .eq('classroom_id', classroomId)
            .eq('join_status', status);

        if (error) throw error;

        if (!keyword) return data;

        const lower = keyword.toLowerCase();
        return data.filter(item =>
            item.users?.display_name?.toLowerCase().includes(lower)
        );
    }

}

module.exports = new ClassroomModel();
