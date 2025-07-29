const express = require('express');
const reviewRouter = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');
const rateLimiter = require('../middlewares/rateLimiter.middleware');

const reviewValidator = require('../validators/review.validator');
const reviewController = require('../controllers/review.controller');

reviewRouter.use(authMiddleware);

reviewRouter.get(
  '/lists/due',
  reviewController.getListsWithDueWords
);

reviewRouter.get(
  '/due',
  reviewController.getDueWords
);

reviewRouter.get(
  '/sessions/status',
  reviewController.getActiveSessionStatus
);

reviewRouter.post(
  '/sessions/start',
  rateLimiter, 
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

