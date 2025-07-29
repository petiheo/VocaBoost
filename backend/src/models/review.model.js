// src/models/review.model.js

const { supabase } = require('../config/supabase.config');

class ReviewModel {
  // =================================================================
  //  FETCHING DUE ITEMS
  // =================================================================

  async findListsWithDueWords(userId, from, to) {
    return await supabase.rpc('get_lists_with_due_words', {
      p_user_id: userId,
      p_limit: to - from + 1,
      p_offset: from,
    });
  }

  async findDueWordsGroupedByList(userId) {
    const { data, error } = await supabase
      .from('user_word_progress')
      .select('vocabulary (id, term, list_id, vocab_lists (title, tags (name)))')
      .eq('user_id', userId)
      .lte('next_review_date', new Date().toISOString());

    if (error) throw error;
    return data;
  }

  // =================================================================
  //  SESSION MANAGEMENT
  // =================================================================

  async findActiveSession(userId) {
    const { data, error } = await supabase
      .from('revision_sessions')
      .select('id, session_type, total_words')
      .eq('user_id', userId)
      .in('status', ['in_progress', 'interrupted'])
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async createSession(userId, listId, sessionType, totalWords) {
    const { data, error } = await supabase
      .from('revision_sessions')
      .insert({
        user_id: userId,
        vocab_list_id: listId,
        session_type: sessionType,
        status: 'in_progress',
        total_words: totalWords,
      })
      .select('id')
      .single();
    
    if (error) throw error;
    return data;
  }

  async getSessionByIdAndUser(sessionId, userId) {
    const { data, error } = await supabase
      .from('revision_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  async updateSessionStatus(sessionId, status, completedAt = null) {
      const updateData = { status };
      if (completedAt) {
          updateData.completed_at = completedAt;
      }
      const { error } = await supabase
        .from('revision_sessions')
        .update(updateData)
        .eq('id', sessionId);
    
    if (error) throw error;
  }

  // =================================================================
  //  SESSION RESULTS & SRS
  // =================================================================

  async recordSessionResult(sessionId, wordId, result, responseTimeMs) {
    const { error } = await supabase.from('session_word_results').insert({
      session_id: sessionId,
      word_id: wordId,
      result: result,
      response_time_ms: responseTimeMs,
    });
    
    if (error) throw error;
  }

  async getWordProgress(userId, wordId) {
    const { data, error } = await supabase
      .from('user_word_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('word_id', wordId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async upsertWordProgress(userId, wordId, newProgressData) {
    const { error } = await supabase.from('user_word_progress').upsert(
      {
        user_id: userId,
        word_id: wordId,
        ...newProgressData,
      },
      { onConflict: 'user_id, word_id' }
    );
    
    if (error) throw error;
  }
  
  async getSessionSummaryStats(sessionId) {
      const { data, error } = await supabase
        .from('session_word_results')
        .select('result')
        .eq('session_id', sessionId);

      if (error) throw error;
      return data;
  }

  async findProgressByWordId(userId, wordId) {
    const { data, error } = await supabase
      .from('user_word_progress')
      .select(`
        next_review_date,
        interval_days,
        ease_factor,
        repetitions,
        correct_count,
        incorrect_count,
        last_reviewed_at
      `)
      .eq('user_id', userId)
      .eq('word_id', wordId)
      .maybeSingle(); // Use maybeSingle to return null instead of erroring if not found

    if (error) throw error;
    return data;
  }
}

module.exports = new ReviewModel();