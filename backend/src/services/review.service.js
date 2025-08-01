const reviewModel = require('../models/review.model');
const vocabularyModel = require('../models/vocabulary.model');
const { ForbiddenError, ValidationError } = require('../utils/errorHandler');
const { shuffleArray } = require('../utils/common');
const logger = require('../utils/logger');

class ReviewService {
  // =================================================================
  // GETTING DUE ITEMS
  // =================================================================
  async getListsWithDueWords(userId, { page = 1, limit = 10 }) {
    const { from, to } = this._getPagination(page, limit);
    const { data, error } = await reviewModel.findListsWithDueWords(
      userId,
      from,
      to
    );
    if (error) throw error;

    return {
      listsWithDueWords: data,
      pagination: { currentPage: page, limit },
    };
  }

  async getUpcomingReviewLists(userId, { page = 1, limit = 5 }) {
    const { from, to } = this._getPagination(page, limit);
    
    const rpcLimit = to - from + 1;
    const rpcOffset = from;

    const { data: lists, error: rpcError } = await reviewModel.findUpcomingReviewLists(userId, rpcLimit, rpcOffset);
    if (rpcError) throw rpcError;
    
    const totalItems = await reviewModel.countListsWithScheduledWords(userId);

    return {
      lists: lists || [],
      pagination: this._formatPagination(page, limit, totalItems)
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

  // =================================================================
  // SESSION MANAGEMENT
  // =================================================================
  async getActiveSession(userId) {
    const activeSession = await reviewModel.findActiveSession(userId);
    if (!activeSession) return null;

    if (!activeSession.word_ids || activeSession.word_ids.length === 0) {
      logger.warn(
        `Active session ${activeSession.id} found without word_ids. Ignoring.`
      );
      return null;
    }

    const { data: sessionWords, error: wordsError } =
      await vocabularyModel.findWordsByIds(activeSession.word_ids);
    if (wordsError) throw wordsError;

    const { data: completedResults, error: resultsError } =
      await reviewModel.getSessionSummaryStats(activeSession.id);
    if (resultsError) throw resultsError;

    const completedWordIds = new Set((completedResults || []).map((r) => r.word_id));
    const remainingWords = (sessionWords || []).filter(
      (word) => !completedWordIds.has(word.id)
    );

    return {
      sessionId: activeSession.id,
      sessionType: activeSession.session_type,
      totalWords: activeSession.total_words,
      completedWords: completedWordIds.size,
      remainingWords: shuffleArray(remainingWords),
    };
  }

  async startSession(userId, listId, sessionType) {
    const existingSession = await reviewModel.findActiveSession(userId);
    if (existingSession) {
      throw new Error(
        'User already has an active session. Please end or resume it first.'
      );
    }

    const dueWords = await reviewModel.findDueWordsByListId(userId, listId, 20);

    if (!dueWords || dueWords.length === 0) {
      throw new Error('No words are currently due for review in this list.');
    }

    const dueWordIds = dueWords.map((word) => word.id);

    const sessionResponse = await reviewModel.createSession(
      userId,
      listId,
      sessionType,
      dueWordIds
    );
    if (sessionResponse.error) throw sessionResponse.error;
    const session = sessionResponse.data;

    return {
      sessionId: session.id,
      sessionType: sessionType,
      totalWords: dueWords.length,
      words: shuffleArray(dueWords),
    };
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

    await reviewModel.updateSessionStatus(
      sessionId,
      'completed',
      new Date().toISOString()
    );

    return {
      sessionId: sessionId,
      totalWords: totalWords,
      correctAnswers: correctAnswers,
      incorrectAnswers: totalWords - correctAnswers,
      accuracy:
        totalWords > 0
          ? parseFloat(((correctAnswers / totalWords) * 100).toFixed(2))
          : 0,
      completedAt: new Date().toISOString(),
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

  // Helper for pagination
  _getPagination(page, size) {
    const limit = size ? +size : 10;
    const from = page ? (page - 1) * limit : 0;
    const to = page ? from + size - 1 : size - 1;
    return { from, to };
  }

  _formatPagination(page, limit, totalItems) {
    const currentPage = Number(page);
    const totalPages = Math.ceil(totalItems / limit);
    return { currentPage, totalPages, totalItems, limit: Number(limit) };
  }
}

module.exports = new ReviewService();
