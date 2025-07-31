const { supabase } = require('../config/supabase.config');

class teacherRequestModel {
  async findByUserId(userId) {
    const { data, error } = await supabase
      .from('teacher_requests')
      .select()
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async create(data) {
    const { data: result, error } = await supabase
      .from('teacher_requests')
      .insert({
        user_id: data.userId,
        institution: data.institution,
        credentials_url: data.credentialsUrl,
        // additionalNotes: data.additionalNotes, // trong DB chưa có
      })
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async update(id, data) {
    const updateData = {
      institution: data.institution,
      credentials_url: data.credentialsUrl,
      status: 'pending', // Reset status to pending when updating
      rejection_reason: null, // Clear any previous rejection reason
      updated_at: new Date().toISOString(),
    };

    const { data: result, error } = await supabase
      .from('teacher_requests')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result;
  }
}

module.exports = new teacherRequestModel();
