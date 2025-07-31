// src/models/statistics.model.js

const { supabase } = require('../config/supabase.config');
const logger = require('../utils/logger');

class StatisticsModel {
  async getSummaryStats(userId) {
    return await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
  }

  async getProgressOverTime(userId) {
    return await supabase
      .from('monthly_user_stats')
      .select('date:month_start_date, wordsMastered:cumulative_words_mastered')
      .eq('user_id', userId)
      .order('month_start_date', { ascending: true });
  }

  async getCompletionRateByRecentList(userId, limit = 5) {
    try {
      const { data: recentSessions, error: sessionError } = await supabase
        .from('revision_sessions')
        .select('vocab_list_id')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false, nullsFirst: false })
        .limit(limit * 2);

      if (sessionError) throw sessionError;
      if (!recentSessions || recentSessions.length === 0) {
        return { data: [], error: null };
      }

      const uniqueListIds = [
        ...new Set(recentSessions.map((s) => s.vocab_list_id)),
      ].slice(0, limit);

      const { data, error } = await supabase.rpc('get_completion_rates_for_lists', {
        p_user_id: userId,
        p_list_ids: uniqueListIds,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logger.error(
        `[getCompletionRateByRecentList] Error for user ${userId}:`,
        error
      );
      return { data: null, error };
    }
  }

  async getStudyConsistency(userId, daysAgo = 90) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    return await supabase
      .from('revision_sessions')
      .select('study_date:completed_at::date')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('completed_at', startDate.toISOString())
      .order('completed_at', { ascending: false });
  }
}

module.exports = new StatisticsModel();
