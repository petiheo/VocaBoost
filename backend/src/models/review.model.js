const { supabase } = require('../config/supabase.config');
const logger = require('../utils/logger');

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

  async findUpcomingReviewLists(userId, limit, offset) {
    return await supabase.rpc('get_upcoming_review_lists', {
      p_user_id: userId,
      p_limit: limit,
      p_offset: offset,
    });
  }

  async countListsWithScheduledWords(userId) {
    const { data, error } = await supabase.rpc(
      'count_distinct_lists_for_user_progress',
      { p_user_id: userId }
    );

    if (error) {
      logger.error(
        `Error counting lists with scheduled words for user ${userId}:`,
        error
      );
      throw error;
    }

    return data || 0;
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

  async findDueWordsByListId(userId, listId, limit = null) {
    try {
      // Step 1: Get the IDs of all words in the specified list.
      const { data: wordsInList, error: listWordsError } = await supabase
        .from('vocabulary')
        .select('id')
        .eq('list_id', listId);
      
      if (listWordsError) throw listWordsError;
      if (!wordsInList || wordsInList.length === 0) {
        return []; // The list is empty.
      }
      
      const wordIdsInList = wordsInList.map(w => w.id);

      // Step 2: From those word IDs, find which ones are due for the user.
      let dueProgressQuery = supabase
        .from('user_word_progress')
        .select('word_id')
        .eq('user_id', userId)
        .in('word_id', wordIdsInList) // Filter only for words in our target list
        .lte('next_review_date', new Date().toISOString());

      if (limit !== null) {
        dueProgressQuery = dueProgressQuery.limit(limit);
      }

      const { data: dueProgressRecords, error: progressError } = await dueProgressQuery;
      if (progressError) throw progressError;

      if (!dueProgressRecords || dueProgressRecords.length === 0) {
        return []; // No words in this list are due for review.
      }
      
      // Step 3: get clean list of word IDs that are due.
      const dueWordIds = dueProgressRecords.map(p => p.word_id);

      // --- The rest of the function proceeds exactly as before ---

      // Step 4: Fetch the full details for only those due words.
      const { data: words, error: wordsError } = await supabase
        .from('vocabulary')
        .select('*')
        .in('id', dueWordIds);
      if (wordsError) throw wordsError;

      // Step 5: Fetch all examples for those specific words.
      const { data: examples, error: examplesError } = await supabase
        .from('vocabulary_examples')
        .select('*')
        .in('vocabulary_id', dueWordIds);
      if (examplesError) throw examplesError;

      // Step 6: Fetch all synonyms for those specific words.
      const { data: synonyms, error: synonymsError } = await supabase
        .from('word_synonyms')
        .select('word_id, synonym')
        .in('word_id', dueWordIds);
      if (synonymsError) throw synonymsError;

      // Step 7: Map the examples and synonyms to their parent words for efficient lookup.
      const examplesMap = new Map();
      (examples || []).forEach((ex) => {
        examplesMap.set(ex.vocabulary_id, ex);
      });

      const synonymsMap = new Map();
      (synonyms || []).forEach((s) => {
        if (!synonymsMap.has(s.word_id)) {
          synonymsMap.set(s.word_id, []);
        }
        synonymsMap.get(s.word_id).push(s.synonym);
      });

      // Step 8: Assemble the final, complete word objects.
      const enrichedWords = words.map((word) => ({
        ...word,
        vocabulary_examples: examplesMap.get(word.id) || null,
        synonyms: synonymsMap.get(word.id) || [],
      }));

      return enrichedWords;
    } catch (error) {
      logger.error(
        `Error in findDueWordsByListId for user ${userId} and list ${listId}:`,
        error
      );
      throw error;
    }
  }

  // =================================================================
  //  SESSION MANAGEMENT
  // =================================================================

  async findActiveSession(userId) {
    const { data, error } = await supabase
      .from('revision_sessions')
      .select('id, session_type, total_words, vocab_list_id, word_ids')
      .eq('user_id', userId)
      .in('status', ['in_progress', 'interrupted'])
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async createSession(userId, listId, sessionType, wordIds) {
    return await supabase
      .from('revision_sessions')
      .insert({
        user_id: userId,
        vocab_list_id: listId,
        session_type: sessionType,
        status: 'in_progress',
        total_words: wordIds.length,
        word_ids: wordIds,
      })
      .select('id')
      .single();
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
    return await supabase
      .from('session_word_results')
      .select('result, word_id')
      .eq('session_id', sessionId);
  }

  async findProgressByWordId(userId, wordId) {
    const { data, error } = await supabase
      .from('user_word_progress')
      .select(
        `
        next_review_date,
        interval_days,
        ease_factor,
        repetitions,
        correct_count,
        incorrect_count,
        last_reviewed_at
      `
      )
      .eq('user_id', userId)
      .eq('word_id', wordId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async findProgressByWordIds(userId, wordIds) {
    if (!wordIds || wordIds.length === 0) {
      return { data: [], error: null };
    }
    return await supabase
      .from('user_word_progress')
      .select(
        `
        word_id,
        next_review_date,
        interval_days,
        ease_factor,
        repetitions,
        correct_count,
        incorrect_count,
        last_reviewed_at
      `
      )
      .eq('user_id', userId)
      .in('word_id', wordIds);
  }

  // =================================================================
  //  USER WORD PROGRESS (NEW METHOD)
  // =================================================================

  async createDefaultWordProgress(userId, wordId) {
    const { error } = await supabase.from('user_word_progress').insert({
      user_id: userId,
      word_id: wordId,
      next_review_date: new Date().toISOString(),
      interval_days: 0,
      ease_factor: 2.5,
      repetitions: 0,
    });

    if (error) {
      if (error.code === '23505') {
        // PostgreSQL duplicate key error code
        logger.warn(
          `Default progress for word ${wordId} already exists for user ${userId}. Ignoring.`
        );
        return;
      }
      throw error;
    }
  }

  async createDefaultWordProgressBulk(progressRecords) {
    const { error } = await supabase
      .from('user_word_progress')
      .insert(progressRecords, { onConflict: 'user_id, word_id', ignore: true });
    if (error) throw error;
  }
}

module.exports = new ReviewModel();
