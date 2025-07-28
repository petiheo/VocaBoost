const express = require('express');
const vocabularyRouter = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');
const uploadMiddleware = require('../middlewares/upload.middleware');
const rateLimiter = require('../middlewares/rateLimiter.middleware');

const vocabularyValidator = require('../validators/vocabulary.validator');
const vocabularyController = require('../controllers/vocabulary.controller');

vocabularyRouter.use(authMiddleware);

vocabularyRouter.post(
  '/lists',
  rateLimiter,
  ...vocabularyValidator.createList,
  vocabularyController.createList
);

vocabularyRouter.get('/my-lists', vocabularyController.getUserLists);

vocabularyRouter.get('/search', vocabularyController.searchPublicLists);

vocabularyRouter.get('/lists/:listId', vocabularyController.getListById);

vocabularyRouter.put(
  '/lists/:listId',
  ...vocabularyValidator.updateList,
  vocabularyController.updateList
);

vocabularyRouter.delete('/lists/:listId', vocabularyController.deleteList);

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

vocabularyRouter.get('/lists/:listId/words', vocabularyController.getWordsByListId);ord

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

vocabularyRouter.post(
  '/words/:wordId/examples',
  ...vocabularyValidator.addExample,
  vocabularyController.addExample
);

vocabularyRouter.get(
  '/words/:wordId/examples',
  vocabularyController.getExamplesByWordId
);

vocabularyRouter.delete('/examples/:exampleId', vocabularyController.deleteExample);

vocabularyRouter.post(
  '/words/:wordId/synonyms',
  ...vocabularyValidator.addSynonyms,
  vocabularyController.addSynonyms
);

vocabularyRouter.get(
  '/words/:wordId/synonyms',
  vocabularyController.getSynonymsByWordId
);

vocabularyRouter.delete(
  '/words/:wordId/synonyms/:synonym',
  vocabularyController.deleteSynonym
);

vocabularyRouter.get('/tags', vocabularyController.getAllTags);

vocabularyRouter.post(
  '/upload-image',
  uploadMiddleware.singleFile('image'),
  vocabularyController.uploadImageForWord
);

module.exports = vocabularyRouter;
