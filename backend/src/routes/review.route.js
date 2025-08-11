const express = require('express');
const reviewRouter = express.Router();

const authenticateMiddleware = require('../middlewares/authenticate.middleware');

const reviewValidator = require('../validators/review.validator');
const reviewController = require('../controllers/review.controller');

reviewRouter.use(authenticateMiddleware);

reviewRouter.get('/lists/due', reviewController.getListsWithDueWords);

reviewRouter.get('/lists/upcoming', reviewController.getUpcomingReviewLists);

reviewRouter.get('/due', reviewController.getDueWords);

reviewRouter.get('/lists/:listId/due-words', reviewController.getDueWordsByList);

reviewRouter.get('/sessions/status', reviewController.getActiveSessionStatus);

reviewRouter.get(
  '/sessions/:sessionId/batch-summary',
  reviewController.getBatchSummary
);

reviewRouter.post('/sessions/:sessionId/resume', reviewController.resumeSession);

reviewRouter.post(
  '/sessions/start',
  ...reviewValidator.startSession,
  reviewController.startSession
);

reviewRouter.post(
  '/sessions/:sessionId/submit',
  ...reviewValidator.submitResult,
  reviewController.submitResult
);

reviewRouter.post(
  '/sessions/:sessionId/end',
  ...reviewValidator.endSession,
  reviewController.endSession
);

module.exports = reviewRouter;
