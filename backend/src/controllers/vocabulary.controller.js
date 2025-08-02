const vocabularyService = require('../services/vocabulary.service');
const storageService = require('../services/storage.service');
const logger = require('../utils/logger');
const { ResponseUtils, ErrorHandler } = require('../utils');

class VocabularyController {
  // =================================================================
  //  VOCABULARY LISTS
  // =================================================================

  async createList(req, res) {
    try {
      const { title, description, privacy_setting, tags } = req.body;
      const creatorId = req.user.userId;

      const newList = await vocabularyService.createList(
        { title, description, privacy_setting, tags },
        creatorId
      );

      return ResponseUtils.success(
        res,
        'Vocabulary list created successfully.',
        { list: newList },
        201
      );
    } catch (error) {
      if (error.isValidationError) {
        return ResponseUtils.validationError(res, 'Validation failed', error.errors);
      }
      return ErrorHandler.handleError(
        res,
        error,
        'createList',
        'Internal server error',
        500
      );
    }
  }

  async getUserLists(req, res) {
    try {
      const userId = req.user.userId;
      const { q, privacy, sortBy, page, limit } = req.query;

      const result = await vocabularyService.findUserLists(userId, {
        q,
        privacy,
        sortBy,
        page,
        limit,
      });

      return ResponseUtils.success(res, null, {
        lists: result.lists,
        pagination: result.pagination,
      });
    } catch (error) {
      return ErrorHandler.handleError(
        res,
        error,
        'getUserLists',
        'Internal server error',
        500
      );
    }
  }

  async getHistoryLists(req, res) {
    try {
      const userId = req.user.userId;
      const { page, limit } = req.query;

      const result = await vocabularyService.findHistoryLists(userId, {
        page,
        limit,
      });

      return ResponseUtils.success(
        res,
        "User's list history retrieved successfully.",
        result
      );
    } catch (error) {
      return ErrorHandler.handleError(
        res,
        error,
        `getHistoryLists - User ${req.user?.userId}`,
        'Failed to retrieve list history.'
      );
    }
  }

  async searchPublicLists(req, res) {
    try {
      const { q, tags, sortBy, page, limit } = req.query;
      const result = await vocabularyService.searchPublicLists({
        q,
        tags,
        sortBy,
        page,
        limit,
      });

      return ResponseUtils.success(res, null, {
        lists: result.lists,
        pagination: result.pagination,
      });
    } catch (error) {
      return ErrorHandler.handleError(
        res,
        error,
        'searchPublicLists',
        'Internal server error',
        500
      );
    }
  }

  async getPopularLists(req, res) {
    try {
      const { page, limit } = req.query;

      const result = await vocabularyService.findPopularLists({ page, limit });

      return ResponseUtils.success(
        res,
        'Popular lists retrieved successfully.',
        result
      );
    } catch (error) {
      return ErrorHandler.handleError(
        res,
        error,
        'getPopularLists',
        'Failed to retrieve popular lists.'
      );
    }
  }

  async getListById(req, res) {
    try {
      const { listId } = req.params;
      const userId = req.user.userId;
      const list = await vocabularyService.findListById(listId, userId);

      if (!list) {
        return ResponseUtils.notFound(res, 'Resource not found.');
      }

      return ResponseUtils.success(res, null, { list });
    } catch (error) {
      if (error.isForbidden) {
        return ResponseUtils.forbidden(
          res,
          'Forbidden: You do not have permission to perform this action.'
        );
      }
      return ErrorHandler.handleError(
        res,
        error,
        'getListById',
        'Internal server error',
        500
      );
    }
  }

  async updateList(req, res) {
    try {
      const { listId } = req.params;
      const userId = req.user.userId;
      const updateData = req.body;

      const updatedList = await vocabularyService.updateList(
        listId,
        userId,
        updateData
      );

      return ResponseUtils.success(res, 'Vocabulary list updated successfully.', {
        list: updatedList,
      });
    } catch (error) {
      if (error.isForbidden) {
        return ResponseUtils.forbidden(
          res,
          'Forbidden: You do not have permission to perform this action.'
        );
      }
      if (error.isValidationError) {
        return ResponseUtils.validationError(res, 'Validation failed', error.errors);
      }
      return ErrorHandler.handleError(
        res,
        error,
        'updateList',
        'Internal server error',
        500
      );
    }
  }

  async deleteList(req, res) {
    try {
      const { listId } = req.params;
      const userId = req.user.userId;

      await vocabularyService.deleteList(listId, userId);

      return ResponseUtils.success(res, 'Vocabulary list deleted successfully.');
    } catch (error) {
      if (error.isForbidden) {
        return ResponseUtils.forbidden(
          res,
          'Forbidden: You do not have permission to perform this action.'
        );
      }
      return ErrorHandler.handleError(
        res,
        error,
        'deleteList',
        'Internal server error',
        500
      );
    }
  }

  // =================================================================
  //  WORDS
  // =================================================================

  async createWord(req, res) {
    try {
      const { listId } = req.params;
      const wordData = req.body;
      const userId = req.user.userId;

      const newWord = await vocabularyService.createWord(listId, wordData, userId);

      return ResponseUtils.success(
        res,
        'Word added successfully.',
        { word: newWord },
        201
      );
    } catch (error) {
      if (error.isForbidden) {
        return ResponseUtils.forbidden(
          res,
          'Forbidden: You do not have permission to perform this action.'
        );
      }
      return ErrorHandler.handleError(
        res,
        error,
        'createWord',
        'Internal server error',
        500
      );
    }
  }

  async createWordsBulk(req, res) {
    try {
      const { listId } = req.params;
      const { words } = req.body;
      const userId = req.user.userId;

      const result = await vocabularyService.createWordsBulk(listId, words, userId);

      return ResponseUtils.success(res, 'Bulk operation completed.', result, 201);
    } catch (error) {
      if (error.isForbidden) {
        return ResponseUtils.forbidden(
          res,
          'Forbidden: You do not have permission to perform this action.'
        );
      }
      return ErrorHandler.handleError(
        res,
        error,
        'createWordsBulk',
        'Internal server error',
        500
      );
    }
  }

  async updateWord(req, res) {
    try {
      const { wordId } = req.params;
      const userId = req.user.userId;
      const updateData = req.body;

      const updatedWord = await vocabularyService.updateWord(
        wordId,
        userId,
        updateData
      );

      return ResponseUtils.success(res, 'Word updated successfully.', {
        word: updatedWord,
      });
    } catch (error) {
      if (error.isForbidden) {
        return ResponseUtils.forbidden(
          res,
          'Forbidden: You do not have permission to perform this action.'
        );
      }
      return ErrorHandler.handleError(
        res,
        error,
        'updateWord',
        'Internal server error',
        500
      );
    }
  }

  async deleteWord(req, res) {
    try {
      const { wordId } = req.params;
      const userId = req.user.userId;

      await vocabularyService.deleteWord(wordId, userId);

      return ResponseUtils.success(res, 'Word deleted successfully.');
    } catch (error) {
      if (error.isForbidden) {
        return ResponseUtils.forbidden(
          res,
          'Forbidden: You do not have permission to perform this action.'
        );
      }
      return ErrorHandler.handleError(
        res,
        error,
        'deleteWord',
        'Internal server error',
        500
      );
    }
  }

  async getWordsByListId(req, res) {
    try {
      const { listId } = req.params;
      const { page, limit } = req.query;
      const userId = req.user.userId;

      const result = await vocabularyService.findWordsByListId(listId, userId, {
        page,
        limit,
      });

      if (!result) {
        return ResponseUtils.notFound(res, 'Resource not found.');
      }

      return ResponseUtils.success(res, null, {
        words: result.words,
        pagination: result.pagination,
      });
    } catch (error) {
      if (error.isForbidden) {
        return ResponseUtils.forbidden(
          res,
          'Forbidden: You do not have permission to perform this action.'
        );
      }
      return ErrorHandler.handleError(
        res,
        error,
        'getWordsByListId',
        'Internal server error',
        500
      );
    }
  }

  async getWordById(req, res) {
    try {
      const { wordId } = req.params;
      const userId = req.user.userId;

      const word = await vocabularyService.findWordById(wordId, userId);

      if (!word) {
        return ResponseUtils.notFound(res, 'Word not found.');
      }

      return ResponseUtils.success(res, null, { word });
    } catch (error) {
      if (error.isForbidden) {
        return ResponseUtils.forbidden(
          res,
          'Forbidden: You do not have permission to view this word.'
        );
      }
      return ErrorHandler.handleError(
        res,
        error,
        'getWordById',
        'Internal server error',
        500
      );
    }
  }

  async searchWordsInList(req, res) {
    try {
      const { listId } = req.params;
      const { q, sortBy, page, limit } = req.query;
      const userId = req.user.userId;

      if (!q) {
        return ResponseUtils.validationError(res, 'Validation failed', [
          { field: 'q', message: "A search query 'q' is required." },
        ]);
      }

      const result = await vocabularyService.searchWordsInList(listId, userId, {
        q,
        sortBy,
        page,
        limit,
      });

      return ResponseUtils.success(res, null, {
        words: result.words,
        pagination: result.pagination,
      });
    } catch (error) {
      if (error.isForbidden) {
        return ResponseUtils.forbidden(
          res,
          'Forbidden: You do not have permission to view this list.'
        );
      }

      return ErrorHandler.handleError(
        res,
        error,
        'searchWordsInList',
        'Internal server error',
        500
      );
    }
  }

  // =================================================================
  //  TAGS & UPLOADS
  // =================================================================

  async getAllTags(req, res) {
    try {
      const tags = await vocabularyService.findAllTags();
      return ResponseUtils.success(res, null, { tags });
    } catch (error) {
      return ErrorHandler.handleError(
        res,
        error,
        'getAllTags',
        'Internal server error',
        500
      );
    }
  }

  async uploadImageForWord(req, res) {
    try {
      const file = req.file;
      const userId = req.user.userId;

      if (!file) {
        return ResponseUtils.error(res, 'No image file provided.', 400);
      }

      const imageUrl = await storageService.uploadWordImage(file, userId);
      const { wordId } = req.body;

      if (wordId) {
        await vocabularyService.updateWord(wordId, userId, {
          image_url: imageUrl,
        });
      }

      return ResponseUtils.success(
        res,
        'Image uploaded successfully.',
        { imageUrl },
        201
      );
    } catch (error) {
      return ErrorHandler.handleError(
        res,
        error,
        'uploadImageForWord',
        'Internal server error during file upload.',
        500
      );
    }
  }
}

module.exports = new VocabularyController();
