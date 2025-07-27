const vocabularyService = require('../services/vocabulary.service');
const storageService = require('../services/storage.service');

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

      return res.status(201).json({
        success: true,
        message: 'Vocabulary list created successfully.',
        data: { list: newList },
      });
    } catch (error) {
      if (error.isValidationError) {
        return res.status(400).json({ success: false, errors: error.errors });
      }
      return res.status(500).json({ success: false, error: 'Internal server error' });
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

      return res.status(200).json({
        success: true,
        data: result.lists, 
        pagination: result.pagination,
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Internal server error' });
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

      return res.status(200).json({
        success: true,
        data: result.lists,
        pagination: result.pagination,
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async getListById(req, res) {
    try {
      const { listId } = req.params;
      const userId = req.user.userId;
      const list = await vocabularyService.findListById(listId, userId);

      if (!list) {
        return res.status(404).json({ success: false, error: 'Resource not found.' });
      }

      return res.status(200).json({
        success: true,
        data: { list },
      });
    } catch (error) {
      if (error.isForbidden) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden: You do not have permission to perform this action.',
        });
      }
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async updateList(req, res) {
    try {
      const { listId } = req.params;
      const userId = req.user.userId;
      const updateData = req.body;

      const updatedList = await vocabularyService.updateList(listId, userId, updateData);

      return res.status(200).json({
        success: true,
        message: 'Vocabulary list updated successfully.',
        data: { list: updatedList },
      });
    } catch (error) {
      if (error.isForbidden) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden: You do not have permission to perform this action.',
        });
      }
      if (error.isValidationError) {
        return res.status(400).json({ success: false, errors: error.errors });
      }
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async deleteList(req, res) {
    try {
      const { listId } = req.params;
      const userId = req.user.userId;

      await vocabularyService.deleteList(listId, userId);

      return res.status(200).json({
        success: true,
        message: 'Vocabulary list deleted successfully.',
      });
    } catch (error) {
      if (error.isForbidden) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden: You do not have permission to perform this action.',
        });
      }
      return res.status(500).json({ success: false, error: 'Internal server error' });
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

      return res.status(201).json({
        success: true,
        message: 'Word added successfully.',
        data: { word: newWord },
      });
    } catch (error) {
      if (error.isForbidden) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden: You do not have permission to perform this action.',
        });
      }
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async createWordsBulk(req, res) {
    try {
      const { listId } = req.params; 
      const { words } = req.body;
      const userId = req.user.userId;

      const result = await vocabularyService.createWordsBulk(listId, words, userId);

      return res.status(201).json({
        success: true,
        message: 'Bulk operation completed.',
        data: result,
      });
    } catch (error) {
      if (error.isForbidden) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden: You do not have permission to perform this action.',
        });
      }
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async updateWord(req, res) {
    try {
      const { wordId } = req.params;
      const userId = req.user.userId;
      const updateData = req.body;

      const updatedWord = await vocabularyService.updateWord(wordId, userId, updateData);

      return res.status(200).json({
        success: true,
        message: 'Word updated successfully.',
        data: { word: updatedWord },
      });
    } catch (error) {
      if (error.isForbidden) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden: You do not have permission to perform this action.',
        });
      }
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async deleteWord(req, res) {
    try {
      const { wordId } = req.params;
      const userId = req.user.userId;

      await vocabularyService.deleteWord(wordId, userId);

      return res.status(200).json({ success: true, message: 'Word deleted successfully.' });
    } catch (error) {
      if (error.isForbidden) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden: You do not have permission to perform this action.',
        });
      }
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async getWordsByListId(req, res) {
    try {
      const { listId } = req.params;
      const { page, limit } = req.query;
      const userId = req.user.userId;

      const result = await vocabularyService.findWordsByListId(listId, userId, { page, limit });

      if (!result) {
        return res.status(404).json({ success: false, error: 'Resource not found.' });
      }

      return res.status(200).json({
        success: true,
        data: { words: result.words },
        pagination: result.pagination,
      });
    } catch (error) {
      if (error.isForbidden) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden: You do not have permission to perform this action.',
        });
      }
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  // =================================================================
  //  EXAMPLES
  // =================================================================

  async addExample(req, res) {
    try {
      const { wordId } = req.params;
      const exampleData = req.body;
      const userId = req.user.userId;
      
      const newExample = await vocabularyService.addExample(wordId, exampleData, userId);

      return res.status(201).json({
        success: true,
        message: 'Example sentence added successfully.',
        data: { example: newExample },
      });
    } catch (error) {
      if (error.isForbidden) {
        return res.status(403).json({ success: false, error: 'Forbidden: You do not have permission to perform this action.' });
      }
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async getExamplesByWordId(req, res) {
    try {
      const { wordId } = req.params;
      const userId = req.user.userId;

      const examples = await vocabularyService.getExamplesByWordId(wordId, userId);

      return res.status(200).json({
        success: true,
        data: { examples },
      });
    } catch (error) {
      if (error.isForbidden) {
        return res.status(403).json({ success: false, error: 'Forbidden: You do not have permission to perform this action.' });
      }
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async deleteExample(req, res) {
    try {
      const { exampleId } = req.params;
      const userId = req.user.userId;

      await vocabularyService.deleteExample(exampleId, userId);

      return res.status(200).json({ success: true, message: 'Example sentence deleted successfully.' });
    } catch (error) {
       if (error.isForbidden) {
        return res.status(403).json({ success: false, error: 'Forbidden: You do not have permission to perform this action.' });
      }
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  // =================================================================
  //  SYNONYMS
  // =================================================================

  async addSynonyms(req, res) {
    try {
      const { wordId } = req.params;
      const { synonyms } = req.body;
      const userId = req.user.userId;

      const result = await vocabularyService.addSynonyms(wordId, synonyms, userId);

      return res.status(201).json({
        success: true,
        message: 'Synonyms added successfully.',
        data: result,
      });
    } catch (error) {
      if (error.isForbidden) {
        return res.status(403).json({ success: false, error: 'Forbidden: You do not have permission to perform this action.' });
      }
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async getSynonymsByWordId(req, res) {
    try {
      const { wordId } = req.params;
      const userId = req.user.userId;

      const synonyms = await vocabularyService.getSynonymsByWordId(wordId, userId);

      return res.status(200).json({
        success: true,
        data: { synonyms },
      });
    } catch (error) {
      if (error.isForbidden) {
        return res.status(403).json({ success: false, error: 'Forbidden: You do not have permission to perform this action.' });
      }
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async deleteSynonym(req, res) {
    try {
      const { wordId, synonym } = req.params;
      const userId = req.user.userId;
      
      await vocabularyService.deleteSynonym(wordId, decodeURIComponent(synonym), userId);
      
      return res.status(200).json({ success: true, message: 'Synonym deleted successfully.' });
    } catch (error) {
      if (error.isForbidden) {
        return res.status(403).json({ success: false, error: 'Forbidden: You do not have permission to perform this action.' });
      }
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  // =================================================================
  //  TAGS & UPLOADS
  // =================================================================

  async getAllTags(req, res) {
    try {
      const tags = await vocabularyService.findAllTags();
      return res.status(200).json({
        success: true,
        data: { tags },
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async uploadImageForWord(req, res) {
    try {
      const file = req.file;
      const userId = req.user.userId;

      if (!file) {
        return res.status(400).json({ success: false, error: 'No image file provided.' });
      }

      const imageUrl = await storageService.uploadWordImage(file, userId);
      const { wordId } = req.body;

      if (wordId) {
        await vocabularyService.updateWord(wordId, userId, { image_url: imageUrl });
      }

      return res.status(201).json({
        success: true,
        message: 'Image uploaded successfully.',
        data: { imageUrl },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, error: 'Internal server error during file upload.' });
    }
  }
}

module.exports = new VocabularyController();