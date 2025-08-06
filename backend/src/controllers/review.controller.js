const reviewService = require('../services/review.service');
const { ResponseUtils, ErrorHandler } = require('../utils');

class ReviewController {
  // Corresponds to GET /lists/due
  async getListsWithDueWords(req, res) {
    try {
      const userId = req.user.userId;
      const { page, limit } = req.query;

      const result = await reviewService.getListsWithDueWords(userId, {
        page,
        limit,
      });

      return ResponseUtils.success(res, 'Retrieved lists with due words.', result);
    } catch (error) {
      return ErrorHandler.handleError(
        res,
        error,
        `getListsWithDueWords - User ${req.user?.userId}`,
        'Failed to retrieve lists with due words.'
      );
    }
  }

  async getUpcomingReviewLists(req, res) {
    try {
      const userId = req.user.userId;
      const { page, limit } = req.query;

      const result = await reviewService.getUpcomingReviewLists(userId, {
        page,
        limit,
      });

      return ResponseUtils.success(
        res,
        'Upcoming review lists retrieved successfully.',
        result
      );
    } catch (error) {
      return ErrorHandler.handleError(
        res,
        error,
        `getUpcomingReviewLists - User ${req.user?.userId}`,
        'Failed to retrieve upcoming review lists.'
      );
    }
  }

  // Corresponds to GET /due
  async getDueWords(req, res) {
    try {
      const userId = req.user.userId;
      const result = await reviewService.getDueWords(userId);

      return ResponseUtils.success(res, 'Retrieved all due words.', result);
    } catch (error) {
      return ErrorHandler.handleError(
        res,
        error,
        `getDueWords - User ${req.user?.userId}`,
        'Failed to retrieve due words.'
      );
    }
  }

  async getDueWordsByList(req, res) {
    try {
      const userId = req.user.userId;
      const { listId } = req.params;

      const dueWords = await reviewService.getDueWordsByList(userId, listId);

      return ResponseUtils.success(
        res,
        'Due words for the list retrieved successfully.',
        { words: dueWords }
      );
    } catch (error) {
      if (error.isForbidden) {
        return ResponseUtils.forbidden(res, error.message);
      }
      return ErrorHandler.handleError(
        res,
        error,
        `getDueWordsByList - User ${req.user?.userId}`,
        'Failed to retrieve due words for the list.'
      );
    }
  }

  // Corresponds to GET /sessions/status
  async getActiveSessionStatus(req, res) {
    try {
      const userId = req.user.userId;
      const activeSession = await reviewService.getActiveSession(userId);

      return ResponseUtils.success(res, 'Retrieved active session status.', {
        activeSession,
      });
    } catch (error) {
      return ErrorHandler.handleError(
        res,
        error,
        `getActiveSessionStatus - User ${req.user?.userId}`,
        'Failed to retrieve active session status.'
      );
    }
  }

  // Get batch summary for current completed batch
  async getBatchSummary(req, res) {
    try {
      const userId = req.user.userId;
      const { sessionId } = req.params;

      const summary = await reviewService.getBatchSummary(sessionId, userId);

      return ResponseUtils.success(res, 'Batch summary retrieved successfully.', summary);
    } catch (error) {
      if (error.isForbidden) {
        return ResponseUtils.forbidden(res, error.message);
      }
      return ErrorHandler.handleError(
        res,
        error,
        `getBatchSummary - User ${req.user?.userId}`,
        'Failed to retrieve batch summary.'
      );
    }
  }

  // Resume session after batch summary
  async resumeSession(req, res) {
    try {
      const userId = req.user.userId;
      const { sessionId } = req.params;

      const sessionData = await reviewService.resumeSession(sessionId, userId);

      return ResponseUtils.success(res, 'Session resumed successfully.', sessionData);
    } catch (error) {
      if (error.isForbidden) {
        return ResponseUtils.forbidden(res, error.message);
      }
      return ErrorHandler.handleError(
        res,
        error,
        `resumeSession - User ${req.user?.userId}`,
        'Failed to resume session.'
      );
    }
  }

  // Corresponds to POST /sessions/start
  async startSession(req, res) {
    try {
      const userId = req.user.userId;
      const { listId, sessionType, practiceMode } = req.body;

      const session = await reviewService.startSession(userId, listId, sessionType, practiceMode);

      // Check if we automatically switched to practice mode
      if (session.message) {
        return ResponseUtils.success(
          res,
          session.message,
          { session },
          201
        );
      }

      return ResponseUtils.success(
        res,
        'Session started successfully.',
        { session },
        201
      );
    } catch (error) {
      // Handle specific known errors
      if (error.message.includes('has an active session')) {
        return ResponseUtils.conflict(res, error.message);
      }
      if (error.message.includes('has no words to practice')) {
        return ResponseUtils.error(res, error.message, 404);
      }
      return ErrorHandler.handleError(
        res,
        error,
        `startSession - User ${req.user?.userId}`,
        'Failed to start session.'
      );
    }
  }

  // Corresponds to POST /sessions/:sessionId/submit
  async submitResult(req, res) {
    try {
      const userId = req.user.userId;
      const { sessionId } = req.params;
      const { wordId, result, responseTimeMs } = req.body;

      await reviewService.submitResult(sessionId, userId, {
        wordId,
        result,
        responseTimeMs,
      });

      return ResponseUtils.success(res, 'Result recorded successfully.');
    } catch (error) {
      if (error.isForbidden) {
        return ResponseUtils.forbidden(res, error.message);
      }
      if (error.message.includes('Session is already completed')) {
        return ResponseUtils.conflict(res, error.message);
      }
      return ErrorHandler.handleError(
        res,
        error,
        `submitResult - User ${req.user?.userId}`,
        'Failed to submit result.'
      );
    }
  }

  // Corresponds to POST /sessions/:sessionId/end
  async endSession(req, res) {
    try {
      const userId = req.user.userId;
      const { sessionId } = req.params;

      const summary = await reviewService.endSession(sessionId, userId);

      return ResponseUtils.success(res, 'Session completed.', { summary });
    } catch (error) {
      if (error.isForbidden) {
        return ResponseUtils.forbidden(res, error.message);
      }
      if (error.message.includes('Session is already completed')) {
        return ResponseUtils.conflict(res, error.message);
      }
      return ErrorHandler.handleError(
        res,
        error,
        `endSession - User ${req.user?.userId}`,
        'Failed to end session.'
      );
    }
  }
}

module.exports = new ReviewController();
