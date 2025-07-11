const express = require('express');
const vocabularyRouter = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');
const uploadMiddleware = require('../middlewares/upload.middleware');

const vocabularyValidator = require('../validators/vocabulary.validator');
const vocabularyController = require('../controllers/vocabulary.controller');

const rateLimiter = require('../middlewares/rateLimiter.middleware');

// Vocal List
vocabularyRouter.post(
  '/create-list',
  authMiddleware.verifyToken,
  rateLimiter,
  vocabularyValidator.createList, // Placeholder for validation rules
  vocabularyController.createList
);

vocabularyRouter.get(
  '/my-lists',
  authMiddleware.verifyToken,
  vocabularyController.getUserLists
);

vocabularyRouter.get(
  '/search', // authMiddleware.verifyToken is optional here if you want unauthenticated users to search
  vocabularyController.searchPublicLists
);

vocabularyRouter.get(
  '/get-list/:listId',
  authMiddleware.verifyToken, // Required to check permissions on private lists
  vocabularyController.getListById
);

vocabularyRouter.put(
  '/update-list/:listId',
  authMiddleware.verifyToken,
  vocabularyValidator.updateList, // Placeholder for validation rules
  vocabularyController.updateList
);

vocabularyRouter.delete(
  '/delete-list/:listId',
  authMiddleware.verifyToken,
  vocabularyController.deleteList
);

// Vocabulary
vocabularyRouter.post(
  '/create-word',
  authMiddleware.verifyToken,
  vocabularyValidator.createWord, // Placeholder for validation rules
  vocabularyController.createWord
);

vocabularyRouter.post(
  '/create-words-bulk',
  authMiddleware.verifyToken,
  vocabularyValidator.createWordsBulk, // Placeholder for validation rules
  vocabularyController.createWordsBulk
);

vocabularyRouter.put(
  '/update-word/:wordId',
  authMiddleware.verifyToken,
  vocabularyValidator.updateWord, // Placeholder for validation rules
  vocabularyController.updateWord
);

vocabularyRouter.delete(
  '/delete-word/:wordId',
  authMiddleware.verifyToken,
  vocabularyController.deleteWord
);

vocabularyRouter.get(
  '/get-list/:listId/words',
  authMiddleware.verifyToken,
  vocabularyController.getWordsByListId
);

vocabularyRouter.post(
  '/upload-image',
  authMiddleware.verifyToken,
  uploadMiddleware.single('image'), // 'image' is the field name in the form-data
  vocabularyController.uploadImageForWord
);

// Tags
vocabularyRouter.get('/tags', vocabularyController.getAllTags);

module.exports = vocabularyRouter;
