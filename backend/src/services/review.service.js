const reviewModel = require('../models/review.model');
const vocabularyModel = require('../models/vocabulary.model');
const { ForbiddenError, ValidationError } = require('../utils/errorHandler');
const { shuffleArray } = require('../utils/common');
const logger = require('../utils/logger');
const { PaginationUtil } = require('../utils');

class ReviewService {
  // =================================================================
  // GETTING DUE ITEMS
  // =================================================================
  async getListsWithDueWords(userId, { page = null, limit = null }) {
    let from = null,
      to = null,
      pagination = null;

    if (page !== null && limit !== null) {
      pagination = PaginationUtil.validate(page, limit);
      from = pagination.offset;
      to = pagination.offset + pagination.limit - 1;
    }

    const { data, error } = await reviewModel.findListsWithDueWords(
      userId,
      from,
      to
    );
    if (error) throw error;

    const totalItems = await reviewModel.countListsWithDueWords(userId);

    const formattedLists = (data || []).map((list) => ({
      id: list.id,
      title: list.title,
      description: list.description,
      wordCount: list.word_count,
      creator: {
        id: list.creator.id,
        display_name: list.creator.display_name,
        role: list.creator.role,
        avatar_url: list.creator.avatar_url,
      },
      tags: list.tags.map((t) => t.name),
    }));

    const paginationResult = pagination
      ? PaginationUtil.getMetadata(pagination.page, pagination.limit, totalItems)
      : { totalItems: totalItems || 0 };

    return {
      listsWithDueWords: formattedLists,
      pagination: paginationResult,
    };
  }

  async getUpcomingReviewLists(userId, { page = null, limit = null }) {
    let from = null,
      to = null,
      pagination = null;

    if (page !== null && limit !== null) {
      pagination = PaginationUtil.validate(page, limit);
      from = pagination.offset;
      to = pagination.offset + pagination.limit - 1;
    }

    const { data, error } = await reviewModel.findUpcomingReviewLists(
      userId,
      from,
      to
    );
    if (error) throw error;

    const totalItems = await reviewModel.countListsWithScheduledWords(userId);

    const now = new Date();
    const formattedLists = (data || []).map((list) => {
      const nextReviewDate = new Date(list.next_review_date);
      const diffTime = nextReviewDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        listId: list.id,
        title: list.title,
        description: list.description,
        wordCount: list.word_count,
        creator: {
          id: list.creator.id,
          display_name: list.creator.display_name,
          role: list.creator.role,
          avatar_url: list.creator.avatar_url,
        },
        tags: (list.tags || []).map((t) => t.name),
        next_review_in_days: Math.max(1, diffDays),
      };
    });

    const paginationResult = pagination
      ? PaginationUtil.getMetadata(pagination.page, pagination.limit, totalItems)
      : { totalItems: totalItems || 0 };

    return {
      lists: formattedLists,
      pagination: paginationResult,
    };
  }

  async getDueWords(userId) {
    const rawData = await reviewModel.findDueWordsGroupedByList(userId);
    const dueByList = rawData.reduce((acc, item) => {
      const word = item.vocabulary;
      const list = word.vocab_lists;
      const listId = word.list_id;

      if (!acc[listId]) {
        acc[listId] = {
          listId: listId,
          listTitle: list.title,
          dueWords: [],
        };
      }
      acc[listId].dueWords.push({ id: word.id, term: word.term });
      return acc;
    }, {});

    const result = Object.values(dueByList).map((group) => ({
      ...group,
      dueWordCount: group.dueWords.length,
    }));
    return { dueByList: result, totalDue: rawData.length };
  }

  async getDueWordsByList(userId, listId) {
    const { data: listData, error: listError } =
      await vocabularyModel.findListById(listId);
    if (listError) {
      if (listError.code === 'PGRST116') {
        throw new Error('List not found.');
      }
      throw listError;
    }

    if (!listData) {
      throw new Error('List not found.');
    }

    if (userId !== listData.creator_id) {
      throw new ForbiddenError('User does not have permission to access this list.');
    }

    const dueWords = await reviewModel.findDueWordsByListId(userId, listId);
    if (!dueWords || dueWords.length === 0) {
      return [];
    }

    const dueWordIds = dueWords.map((word) => word.id);
    const { data: progressData, error: progressError } =
      await reviewModel.findProgressByWordIds(userId, dueWordIds);
    if (progressError) throw progressError;

    const progressMap = new Map((progressData || []).map((p) => [p.word_id, p]));

    const wordsWithProgress = dueWords.map((word) => ({
      ...word,
      userProgress: progressMap.get(word.id) || null,
    }));

    return wordsWithProgress;
  }

  // =================================================================
  // SESSION MANAGEMENT
  // =================================================================
  async getActiveSession(userId) {
    // Use optimized method that reduces N+1 queries
    const sessionData = await reviewModel.getActiveSessionOptimized(userId);
    if (!sessionData) return null;

    // Apply shuffling to remaining words for better learning experience
    return {
      ...sessionData,
      remainingWords: shuffleArray(sessionData.remainingWords),
    };
  }

  // Legacy method kept for backward compatibility and fallback
  async getActiveSessionLegacy(userId) {
    const activeSession = await reviewModel.findActiveSession(userId);
    if (!activeSession) return null;

    if (!activeSession.word_ids || activeSession.word_ids.length === 0) {
      logger.warn(
        `Active session ${activeSession.id} found without word_ids. Ignoring.`
      );
      return null;
    }

    // Step 1: Fetch the words
    const { data: sessionWords, error: wordsError } =
      await vocabularyModel.findWordsByIds(activeSession.word_ids);
    if (wordsError) throw wordsError;

    // Step 2: Fetch progress for these words
    const { data: progressData, error: progressError } =
      await reviewModel.findProgressByWordIds(userId, activeSession.word_ids);
    if (progressError) throw progressError;

    const progressMap = new Map((progressData || []).map((p) => [p.word_id, p]));

    const wordsWithProgress = (sessionWords || []).map((word) => ({
      ...word,
      userProgress: progressMap.get(word.id) || null,
    }));

    const { data: completedResults, error: resultsError } =
      await reviewModel.getSessionSummaryStats(activeSession.id);
    if (resultsError) throw resultsError;

    const completedWordIds = new Set((completedResults || []).map((r) => r.word_id));

    const remainingWords = wordsWithProgress.filter(
      (word) => !completedWordIds.has(word.id)
    );

    // Calculate current batch info
    const totalCompleted = completedWordIds.size;
    const wordsPerBatch = 10;
    const currentBatch = Math.floor(totalCompleted / wordsPerBatch) + 1;
    const wordsInCurrentBatch = totalCompleted % wordsPerBatch;
    const needsSummary = wordsInCurrentBatch === 0 && totalCompleted > 0;

    return {
      sessionId: activeSession.id,
      sessionType: activeSession.session_type,
      totalWords: activeSession.total_words,
      completedWords: totalCompleted,
      remainingWords: shuffleArray(remainingWords),
      currentBatch,
      wordsInCurrentBatch,
      needsSummary,
      wordsPerBatch,
    };
  }

  async startSession(userId, listId, sessionType, practiceMode = false) {
    const existingSession = await reviewModel.findActiveSession(userId);
    if (existingSession) {
      // Auto-end the existing session if it's been active for more than 30 minutes
      // or if it's for a different list
      const sessionStartTime = new Date(existingSession.started_at);
      const now = new Date();
      const timeDiff = now - sessionStartTime;
      const thirtyMinutes = 30 * 60 * 1000; // 30 minutes in milliseconds

      if (timeDiff > thirtyMinutes || existingSession.vocab_list_id !== listId) {
        // Auto-end the abandoned session
        try {
          await reviewModel.updateSessionStatus(existingSession.id, 'interrupted');
          logger.info(
            `Auto-ended abandoned session ${existingSession.id} for user ${userId}`
          );
        } catch (error) {
          logger.warn(`Failed to auto-end session ${existingSession.id}:`, error);
        }
      } else {
        // Session is recent and for the same list, throw error to let user decide
        throw new Error(
          'User already has an active session. Please end or resume it first.'
        );
      }
    }

    let words;
    let actualMode = practiceMode;

    if (practiceMode) {
      // Practice mode: get all words from the list regardless of due status
      words = await reviewModel.findAllWordsByListId(listId, 20);
    } else {
      // Normal mode: try to get due words first
      words = await reviewModel.findDueWordsByListId(userId, listId, 20);

      // If no due words found, automatically switch to practice mode
      if (!words || words.length === 0) {
        words = await reviewModel.findAllWordsByListId(listId, 20);
        actualMode = true; // Switch to practice mode
        logger.info(
          `No due words found for list ${listId}, automatically switching to practice mode`
        );
      }
    }

    if (!words || words.length === 0) {
      throw new Error('This list has no words to practice.');
    }

    const wordIds = words.map((word) => word.id);

    const sessionResponse = await reviewModel.createSession(
      userId,
      listId,
      sessionType,
      wordIds
    );
    if (sessionResponse.error) throw sessionResponse.error;
    const session = sessionResponse.data;

    return {
      sessionId: session.id,
      sessionType: sessionType,
      totalWords: words.length,
      words: shuffleArray(words),
      practiceMode: actualMode,
      message:
        actualMode && !practiceMode
          ? 'No due words found. Started practice session with all words.'
          : null,
    };
  }

  async getBatchSummary(sessionId, userId) {
    const session = await reviewModel.getSessionByIdAndUser(sessionId, userId);
    if (!session)
      throw new ForbiddenError(
        'Session not found or you do not have permission to access it.'
      );

    const { data: results, error } =
      await reviewModel.getSessionSummaryStats(sessionId);
    if (error) throw error;

    const totalCompleted = results.length;
    const wordsPerBatch = 10;
    const currentBatch = Math.floor((totalCompleted - 1) / wordsPerBatch) + 1;

    // Get results for current batch (last 10 completed words)
    const batchStartIndex = Math.max(0, totalCompleted - wordsPerBatch);
    const currentBatchResults = results.slice(batchStartIndex);

    const correctInBatch = currentBatchResults.filter(
      (r) => r.result === 'correct'
    ).length;
    const totalInBatch = currentBatchResults.length;

    // Get word details for the batch
    const wordIds = currentBatchResults.map((r) => r.word_id);
    const { data: batchWords, error: wordsError } =
      await vocabularyModel.findWordsByIds(wordIds);
    if (wordsError) throw wordsError;

    const wordsWithResults = (batchWords || []).map((word) => {
      const result = currentBatchResults.find((r) => r.word_id === word.id);
      return {
        ...word,
        result: result?.result,
        responseTime: result?.response_time_ms,
      };
    });

    return {
      sessionId,
      listId: session.vocab_list_id,
      batchNumber: currentBatch,
      totalBatches: Math.ceil(session.total_words / wordsPerBatch),
      wordsInBatch: totalInBatch,
      correctAnswers: correctInBatch,
      accuracy:
        totalInBatch > 0 ? Math.round((correctInBatch / totalInBatch) * 100) : 0,
      words: wordsWithResults,
      overallProgress: {
        totalWords: session.total_words,
        completedWords: totalCompleted,
        overallAccuracy:
          totalCompleted > 0
            ? Math.round(
                (results.filter((r) => r.result === 'correct').length /
                  totalCompleted) *
                  100
              )
            : 0,
      },
    };
  }

  async resumeSession(sessionId, userId) {
    const session = await reviewModel.getSessionByIdAndUser(sessionId, userId);
    if (!session)
      throw new ForbiddenError(
        'Session not found or you do not have permission to access it.'
      );
    if (session.status === 'completed')
      throw new Error('Session is already completed.');

    return this.getActiveSession(userId);
  }

  async endSession(sessionId, userId) {
    const session = await reviewModel.getSessionByIdAndUser(sessionId, userId);
    if (!session)
      throw new ForbiddenError(
        'Session not found or you do not have permission to access it.'
      );
    if (session.status === 'completed')
      throw new Error('Session is already completed.');

    const { data: results, error } =
      await reviewModel.getSessionSummaryStats(sessionId);
    if (error) throw error;

    const correctAnswers = (results || []).filter(
      (r) => r.result === 'correct'
    ).length;
    const totalWords = session.total_words;

    // Get detailed word results for final summary
    const wordIds = session.word_ids || [];
    const { data: sessionWords, error: wordsError } =
      await vocabularyModel.findWordsByIds(wordIds);
    if (wordsError) throw wordsError;

    // Combine words with their results
    const wordsWithResults = (sessionWords || []).map((word) => {
      const result = (results || []).find((r) => r.word_id === word.id);
      return {
        ...word,
        result: result?.result || 'not_attempted',
        responseTime: result?.response_time_ms,
      };
    });

    // Calculate batch summaries
    const wordsPerBatch = 10;
    const totalBatches = Math.ceil(totalWords / wordsPerBatch);
    const batchSummaries = [];

    for (let i = 0; i < totalBatches; i++) {
      const batchStartIndex = i * wordsPerBatch;
      const batchEndIndex = Math.min(batchStartIndex + wordsPerBatch, totalWords);
      const batchResults = (results || []).slice(batchStartIndex, batchEndIndex);
      const batchCorrect = batchResults.filter((r) => r.result === 'correct').length;

      batchSummaries.push({
        batchNumber: i + 1,
        wordsInBatch: batchResults.length,
        correctAnswers: batchCorrect,
        accuracy:
          batchResults.length > 0
            ? Math.round((batchCorrect / batchResults.length) * 100)
            : 0,
      });
    }

    await reviewModel.updateSessionStatus(
      sessionId,
      'completed',
      new Date().toISOString()
    );

    // Update list access after session completion to ensure it remains accessible
    try {
      await vocabularyModel.updateListAccess(session.vocab_list_id, userId);
    } catch (error) {
      // Log but don't fail the session end if list access update fails
      logger.warn(
        `Failed to update list access for list ${session.vocab_list_id}:`,
        error
      );
    }

    return {
      sessionId: sessionId,
      listId: session.vocab_list_id,
      totalWords: totalWords,
      correctAnswers: correctAnswers,
      incorrectAnswers: totalWords - correctAnswers,
      accuracy:
        totalWords > 0
          ? parseFloat(((correctAnswers / totalWords) * 100).toFixed(2))
          : 0,
      completedAt: new Date().toISOString(),
      words: wordsWithResults,
      batchSummaries: batchSummaries,
      totalBatches: totalBatches,
    };
  }

  // =================================================================
  // SRS LOGIC (THE CORE)
  // =================================================================
  async submitResult(sessionId, userId, { wordId, result, responseTimeMs }) {
    const session = await reviewModel.getSessionByIdAndUser(sessionId, userId);
    if (!session)
      throw new ForbiddenError(
        'Session not found or you do not have permission to access it.'
      );
    if (session.status === 'completed')
      throw new Error('Session is already completed.');

    await reviewModel.recordSessionResult(sessionId, wordId, result, responseTimeMs);
    let progress = await reviewModel.getWordProgress(userId, wordId);

    if (!progress) {
      progress = {
        repetitions: 0,
        ease_factor: 2.5, // Standard starting ease factor
        interval_days: 0,
      };
    }

    const newProgress = this._calculateSm2(progress, result === 'correct');

    await reviewModel.upsertWordProgress(userId, wordId, newProgress);
  }

  /**
   * Implements the core SuperMemo 2 (SM-2) spaced repetition algorithm.
   * @param {object} progress - The current progress object for the word.
   * @param {number} progress.repetitions - The number of consecutive correct reviews.
   * @param {number} progress.ease_factor - A multiplier for the interval (how "easy" the word is).
   * @param {number} progress.interval_days - The current review interval in days.
   * @param {boolean} isCorrect - The user's answer (true for correct, false for incorrect).
   * @returns {object} The new progress object with updated values.
   * @private
   */
  _calculateSm2(progress, isCorrect) {
    let { repetitions, ease_factor, interval_days } = progress;

    if (isCorrect) {
      repetitions += 1;
      if (repetitions === 1) {
        interval_days = 1;
      } else if (repetitions === 2) {
        interval_days = 6;
      } else {
        interval_days = Math.round(progress.interval_days * ease_factor);
      }
    } else {
      repetitions = 0;
      interval_days = 1;
      ease_factor = Math.max(1.3, ease_factor - 0.2);
    }

    if (ease_factor < 1.3) {
      ease_factor = 1.3;
    }

    const now = new Date();
    const next_review_date = new Date(now.setDate(now.getDate() + interval_days));

    return {
      repetitions,
      ease_factor,
      interval_days,
      next_review_date: next_review_date.toISOString(),
      last_reviewed_at: new Date().toISOString(),
    };
  }
}

module.exports = new ReviewService();
