const express = require('express');
const vocabularyRouter = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');
const uploadMiddleware = require('../middlewares/upload.middleware');
const rateLimiter = require('../middlewares/rateLimiter.middleware');

const vocabularyValidator = require('../validators/vocabulary.validator');
const vocabularyController = require('../controllers/vocabulary.controller');

vocabularyRouter.post(
  '/lists',
  authMiddleware.verifyToken,
  rateLimiter,
  ...vocabularyValidator.createList,
  vocabularyController.createList
);

vocabularyRouter.get(
  '/my-lists',
  authMiddleware.verifyToken,
  vocabularyController.getUserLists
);

vocabularyRouter.get('/search', vocabularyController.searchPublicLists);

vocabularyRouter.get(
  '/lists/:listId',
  authMiddleware.verifyToken,
  vocabularyController.getListById
);

vocabularyRouter.put(
  '/lists/:listId',
  authMiddleware.verifyToken,
  ...vocabularyValidator.updateList,
  vocabularyController.updateList
);

vocabularyRouter.delete(
  '/lists/:listId',
  authMiddleware.verifyToken,
  vocabularyController.deleteList
);

vocabularyRouter.post(
  '/lists/:listId/words',
  authMiddleware.verifyToken,
  ...vocabularyValidator.createWord,
  vocabularyController.createWord
);

vocabularyRouter.post(
  '/lists/:listId/words-bulk',
  authMiddleware.verifyToken,
  ...vocabularyValidator.createWordsBulk,
  vocabularyController.createWordsBulk
);

vocabularyRouter.get(
  '/lists/:listId/words',
  authMiddleware.verifyToken,
  vocabularyController.getWordsByListId
);

vocabularyRouter.put(
  '/words/:wordId',
  authMiddleware.verifyToken,
  ...vocabularyValidator.updateWord,
  vocabularyController.updateWord
);

vocabularyRouter.delete(
  '/words/:wordId',
  authMiddleware.verifyToken,
  vocabularyController.deleteWord
);

vocabularyRouter.post(
  '/words/:wordId/examples',
  authMiddleware.verifyToken,
  ...vocabularyValidator.addExample,
  vocabularyController.addExample
);

vocabularyRouter.get(
  '/words/:wordId/examples',
  authMiddleware.verifyToken,
  vocabularyController.getExamplesByWordId
);

vocabularyRouter.delete(
  '/examples/:exampleId',
  authMiddleware.verifyToken,
  vocabularyController.deleteExample
);

vocabularyRouter.post(
  '/words/:wordId/synonyms',
  authMiddleware.verifyToken,
  ...vocabularyValidator.addSynonyms,
  vocabularyController.addSynonyms
);

vocabularyRouter.get(
  '/words/:wordId/synonyms',
  authMiddleware.verifyToken,
  vocabularyController.getSynonymsByWordId
);

vocabularyRouter.delete(
  '/words/:wordId/synonyms/:synonym',
  authMiddleware.verifyToken,
  vocabularyController.deleteSynonym
);

vocabularyRouter.get(
  '/tags', 
  vocabularyController.getAllTags
);

vocabularyRouter.post(
  '/upload-image',
  authMiddleware.verifyToken,
  uploadMiddleware.single('image'),
  vocabularyController.uploadImageForWord
);

module.exports = vocabularyRouter;