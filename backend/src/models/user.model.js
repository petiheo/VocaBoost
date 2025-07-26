const supabase = require('../config/database');

class UserModel {
  async findById(id) {
    const { data, error } = await supabase
      .from('users')
      .select()
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async findByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select()
      .eq('email', email)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async create(email, hashedPassword, role) {
    const { data, error } = await supabase
      .from('users')
      .insert({
        email: email,
        password_hash: hashedPassword,
        role: role,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findByGoogleId(id) {
    const { data, error } = await supabase
      .from('users')
      .select()
      .eq('google_id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async updateGoogleId(userId, googleId) {
    const { data, error } = await supabase
      .from('users')
      .update({
        google_id: googleId,
        email_verified: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateDisplayName(id, displayName) {
    const { data, error } = await supabase
      .from('users')
      .update({
        display_name: displayName,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateAvatar(id, avatarUrl) {
    const { data, error } = await supabase
      .from('users')
      .update({
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async createGoogleUser({
    email,
    googleId,
    displayName,
    avatarUrl,
    role = 'learner',
  }) {
    const { data, error } = await supabase
      .from('users')
      .insert({
        email,
        google_id: googleId,
        display_name: displayName,
        avatar_url: avatarUrl,
        role,
        email_verified: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updatePassword(id, hashedPassword) {
    return await supabase
      .from('users')
      .update({
        password_hash: hashedPassword,
        password_changed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
  }

  async verifyEmail(id) {
    const { data, error } = await supabase
      .from('users')
      .update({
        email_verified: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async hasReportedWord(reporterId, wordId) {
    const { data, error } = await supabase
      .from('reports')
      .select()
      .eq('reporter_id', reporterId)
      .eq('word_id', wordId)
      .eq('status', 'open')
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async createReport(reporterId, wordId, reason) {
    const { data, error } = await supabase
      .from('reports')
      .insert({
        reporter_id: reporterId,
        word_id: wordId,
        reason: reason,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateDailyGoal(userId, dailyGoal) {
    const { data, error } = await supabase
      .from('user_settings')
      .update({
        daily_goal: dailyGoal,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateUserStatus(userId, newStatus) {
    const { data, error } = supabase
      .from('users')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateUserRole(userId, newRole) {
    const { data, error } = supabase
      .from('users')
      .update({
        role: newRole,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

module.exports = new UserModel();
