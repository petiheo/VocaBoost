const { supabase } = require('../config/supabase.config');

class UserProfileModel {
  async getProfile(userId) {
    const { data, error } = await supabase
      .from('users')
      .select(
        `
        id,
        email,
        display_name,
        avatar_url,
        role,
        created_at,
        user_settings (
          daily_goal,
          timezone,
          language,
          theme,
          notification_preferences,
          learning_preferences
        )
      `
      )
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  // Get or create user settings
  async getOrCreateSettings(userId) {
    let { data, error } = await supabase
      .from('user_settings')
      .select()
      .eq('user_id', userId)
      .single();

    if (error?.code === 'PGRST116') {
      // Not found
      const { data: newSettings, error: createError } = await supabase
        .from('user_settings')
        .insert({ user_id: userId })
        .select()
        .single();

      if (createError) throw createError;
      return newSettings;
    }

    if (error) throw error;
    return data;
  }

  async getVocabularyListCount(userId) {
    const { count, error } = await supabase
      .from('vocab_lists')
      .select('*', { count: 'exact', head: true })
      .eq('creator_id', userId)
      .eq('is_active', true);

    if (error) throw error;
    return count || 0;
  }
}

module.exports = new UserProfileModel();
