const express = require('express');
const vocabularyRouter = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');
const uploadMiddleware = require('../middlewares/upload.middleware');
const rateLimiter = require('../middlewares/rateLimiter.middleware');

const vocabularyValidator = require('../validators/vocabulary.validator');
const vocabularyController = require('../controllers/vocabulary.controller');

vocabularyRouter.use(authMiddleware);

// =================================================================
//  LIST ROUTES
// =================================================================

vocabularyRouter.post(
  '/lists',
  rateLimiter,
  ...vocabularyValidator.createList,
  vocabularyController.createList
);

vocabularyRouter.get('/my-lists', vocabularyController.getUserLists);

vocabularyRouter.get('/lists/history', vocabularyController.getHistoryLists);

vocabularyRouter.get('/search', vocabularyController.searchPublicLists);

vocabularyRouter.get('/lists/:listId', vocabularyController.getListById);

vocabularyRouter.put(
  '/lists/:listId',
  ...vocabularyValidator.updateList,
  vocabularyController.updateList
);

vocabularyRouter.delete('/lists/:listId', vocabularyController.deleteList);

// =================================================================
//  WORD ROUTES
// =================================================================

vocabularyRouter.post(
  '/lists/:listId/words',
  ...vocabularyValidator.createWord,
  vocabularyController.createWord
);

vocabularyRouter.post(
  '/lists/:listId/words-bulk',
  ...vocabularyValidator.createWordsBulk,
  vocabularyController.createWordsBulk
);

vocabularyRouter.get('/lists/:listId/words', vocabularyController.getWordsByListId);

vocabularyRouter.get('/words/:wordId', vocabularyController.getWordById);

vocabularyRouter.get(
  '/lists/:listId/words/search',
  vocabularyController.searchWordsInList
);

vocabularyRouter.put(
  '/words/:wordId',
  ...vocabularyValidator.updateWord,
  vocabularyController.updateWord
);

vocabularyRouter.delete('/words/:wordId', vocabularyController.deleteWord);

// =================================================================
//  TAGS & UPLOADS
// =================================================================

vocabularyRouter.get('/tags', vocabularyController.getAllTags);

vocabularyRouter.post(
  '/upload-image',
  uploadMiddleware.singleFile('image'),
  vocabularyController.uploadImageForWord
);

module.exports = vocabularyRouter;
