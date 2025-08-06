const vocabularyModel = require('../models/vocabulary.model');
const reviewModel = require('../models/review.model');
const logger = require('../utils/logger');
const aiService = require('./ai.service');
class ForbiddenError extends Error {
  constructor(message = 'User does not have permission for this action.') {
    super(message);
    this.name = 'ForbiddenError';
    this.isForbidden = true;
  }
}
class ValidationError extends Error {
  constructor(errors) {
    super('Validation failed.');
    this.name = 'ValidationError';
    this.isValidationError = true;
    this.errors = errors;
  }
}

class VocabularyService {
  // =================================================================
  //  VOCABULARY LISTS
  // =================================================================

  async createList(listData, creatorId) {
    const { data, error } = await vocabularyModel.createListWithTags({
      ...listData,
      creatorId,
    });

    if (error) {
      if (error.message.includes('does not exist')) {
        throw new ValidationError([{ field: 'tags', message: error.message }]);
      }
      throw error;
    }

    data.tags = data.tags.map((t) => t.name);
    return data;
  }

  async findUserLists(userId, options) {
    const { page = null, limit = null } = options;
    const { from, to } = this._getPagination(page, limit);
    const { data, error, count } = await vocabularyModel.findUserLists(userId, {
      ...options,
      from,
      to,
    });

    if (error) throw error;

    const lists = data.map((list) => ({
      ...list,
      tags: list.tags.map((t) => t.name),
    }));
    return { lists, pagination: this._formatPagination(page, limit, count) };
  }

  async searchPublicLists(options) {
    const { page = null, limit = null } = options;
    const { from, to } = this._getPagination(page, limit);
    const { data, error, count } = await vocabularyModel.searchPublicLists({
      ...options,
      from,
      to,
    });

    if (error) throw error;

    const lists = data.map((list) => ({
      ...list,
      tags: list.tags.map((t) => t.name),
    }));
    return { lists, pagination: this._formatPagination(page, limit, count) };
  }

  async findListById(listId, userId, skipPermissionCheck = false) {
    const { data: list, error } = await vocabularyModel.findListById(listId);
    if (error || !list) return null;

    if (
      !skipPermissionCheck &&
      list.privacy_setting === 'private' &&
      list.creator_id !== userId
    ) {
      throw new ForbiddenError(
        'You do not have permission to view this private list.'
      );
    }

    if (!skipPermissionCheck) {
      await vocabularyModel.upsertListHistory(userId, listId).catch((err) => {
        logger.error(
          `Failed to update history for user ${userId} and list ${listId}:`,
          err
        );
      });
    }

    list.tags = list.tags.map((t) => t.name);
    return list;
  }

  async findHistoryLists(userId, { page = null, limit = null }) {
    const { from, to } = this._getPagination(page, limit);

    const { data, error, count } = await vocabularyModel.findHistoryLists(
      userId,
      from,
      to
    );
    if (error) throw error;

    return {
      lists: data || [],
      pagination: this._formatPagination(page, limit, count),
    };
  }

  async findPopularLists({ page = null, limit = null }) {
    const { from, to } = this._getPagination(page, limit);

    const { data, error, count } = await vocabularyModel.findPopularLists(from, to);
    if (error) throw error;

    return {
      lists: data || [],
      pagination: this._formatPagination(page, limit, count),
    };
  }

  async updateList(listId, userId, updateData) {
    await this._verifyListOwnership(listId, userId);

    const { title, description, privacy_setting, tags } = updateData;
    const allowedUpdates = { title, description, privacy_setting };

    if (tags) {
      const tagIds = await this._validateAndGetTagIds(tags);
      await vocabularyModel.disassociateAllTagsFromList(listId);
      if (tagIds.length > 0) {
        const listTagRelations = tagIds.map((tagId) => ({
          list_id: listId,
          tag_id: tagId,
        }));
        const { error: tagsError } =
          await vocabularyModel.associateTagsToList(listTagRelations);
        if (tagsError) throw tagsError;
      }
    }

    const { data: updatedList, error } = await vocabularyModel.updateList(
      listId,
      allowedUpdates
    );
    if (error) throw error;

    updatedList.tags = updatedList.tags.map((t) => t.name);
    return updatedList;
  }

  async deleteList(listId, userId) {
    await this._verifyListOwnership(listId, userId);
    const { error } = await vocabularyModel.deleteList(listId);
    if (error) throw error;
  }

  // =================================================================
  //  WORDS
  // =================================================================

  async createWord(listId, wordData, userId) {
    await this._verifyListOwnership(listId, userId);

    const {
      term,
      definition,
      translation,
      phonetics,
      image_url,
      exampleSentence,
      synonyms,
      aiGenerated,
      generationPrompt,
    } = wordData;

    // 1. Create the core word
    const { data: newWord, error } = await vocabularyModel.createWord({
      list_id: listId,
      term,
      definition,
      translation,
      phonetics,
      image_url,
      created_by: userId,
    });
    if (error) throw error;

    // 2. Add the optional example
    if (exampleSentence) {
      await vocabularyModel.upsertExample(newWord.id, {
        exampleSentence,
        aiGenerated: aiGenerated || false,
        generationPrompt: generationPrompt || null,
      });
    }

    // 3. Add the optional synonyms
    if (synonyms && Array.isArray(synonyms) && synonyms.length > 0) {
      const synonymsToInsert = synonyms.map((s) => ({
        word_id: newWord.id,
        synonym: s.trim(),
      }));
      await vocabularyModel.createSynonyms(synonymsToInsert).catch((err) => {
        logger.error(`Failed to add synonyms for new word ${newWord.id}:`, err);
      });
    }

    // 4. create default user word progress
    await reviewModel.createDefaultWordProgress(userId, newWord.id);

    await vocabularyModel.updateWordCount(listId);

    // Return the full, newly created word object
    const { data: finalWord, error: fetchError } = await vocabularyModel.findById(
      newWord.id
    );
    if (fetchError) throw fetchError;
    return finalWord;
  }

  async createWordsBulk(listId, words, userId) {
    await this._verifyListOwnership(listId, userId);

    const { wordsToInsert, errors } = this._prepareBulkWords(listId, words, userId);

    if (wordsToInsert.length === 0) {
      return { createdCount: 0, failedCount: errors.length, errors };
    }

    const { data: newWords, error: insertError } =
      await vocabularyModel.createWordsBulkAndReturn(wordsToInsert);
    if (insertError) throw insertError;

    const finalExamples = this._mapSubItemsToNewWords(words, newWords, 'example');
    const finalSynonyms = this._mapSubItemsToNewWords(words, newWords, 'synonym');

    if (finalExamples.length > 0) {
      await vocabularyModel
        .createExamplesBulk(finalExamples)
        .catch((err) => logger.error('Bulk example creation failed:', err));
    }
    if (finalSynonyms.length > 0) {
      await vocabularyModel
        .createSynonyms(finalSynonyms)
        .catch((err) => logger.error('Bulk synonym creation failed:', err));
    }

    if (newWords && newWords.length > 0) {
      const progressRecords = newWords.map((word) => ({
        user_id: userId,
        word_id: word.id,
        next_review_date: new Date().toISOString(),
        interval_days: 0,
        ease_factor: 2.5,
        repetitions: 0,
      }));
      await reviewModel.createDefaultWordProgressBulk(progressRecords);
    }

    await vocabularyModel.updateWordCount(listId);
    return { createdCount: newWords.length, failedCount: errors.length, errors };
  }

  async updateWord(wordId, userId, updateData) {
    await this._verifyWordPermission(wordId, userId);

    const {
      term,
      definition,
      translation,
      phonetics,
      image_url,
      exampleSentence,
      synonyms,
      aiGenerated,
      generationPrompt,
    } = updateData;

    // 1. Update core word fields
    const wordFieldsToUpdate = {
      term,
      definition,
      translation,
      phonetics,
      image_url,
    };
    const cleanedWordUpdates = Object.fromEntries(
      Object.entries(wordFieldsToUpdate).filter(([_, v]) => v !== undefined)
    );
    if (Object.keys(cleanedWordUpdates).length > 0) {
      await vocabularyModel.updateWord(wordId, cleanedWordUpdates);
    }

    // 2. Update the example (if provided)
    if (exampleSentence !== undefined) {
      if (exampleSentence) {
        await vocabularyModel.upsertExample(wordId, {
          exampleSentence,
          aiGenerated: aiGenerated || false,
          generationPrompt: generationPrompt || null,
        });
      } else {
        await vocabularyModel.deleteExample(wordId);
      }
    }

    // 3. Overwrite synonyms (if provided)
    if (synonyms !== undefined) {
      await vocabularyModel.deleteSynonymsByWordId(wordId); // Clear existing
      if (synonyms.length > 0) {
        const synonymsToInsert = synonyms.map((s) => ({
          word_id: wordId,
          synonym: s.trim(),
        }));
        await vocabularyModel.createSynonyms(synonymsToInsert);
      }
    }

    const { data: finalWord, error: fetchError } =
      await vocabularyModel.findById(wordId);
    if (fetchError) throw fetchError;
    return finalWord;
  }

  async deleteWord(wordId, userId) {
    const listId = await this._verifyWordPermission(wordId, userId);
    const { error } = await vocabularyModel.deleteWord(wordId);
    if (error) throw error;

    await vocabularyModel.updateWordCount(listId);
  }

  async findWordsByListId(listId, userId, { page = null, limit = null }) {
    await this.findListById(listId, userId);
    const { from, to } = this._getPagination(page, limit);
    const {
      data: words,
      error,
      count,
    } = await vocabularyModel.findWordsByListId(listId, from, to);
    if (error) throw error;
    return { words, pagination: this._formatPagination(page, limit, count) };
  }

  async findWordById(wordId, userId) {
    await this._verifyWordPermission(wordId, userId, 'read');

    const { data: word, error } = await vocabularyModel.findById(wordId);
    if (error) throw error;

    const userProgress = await reviewModel.findProgressByWordId(userId, wordId);

    return {
      ...word,
      userProgress: userProgress,
    };
  }

  async searchWordsInList(listId, userId, options) {
    const { page = null, limit = null, sortBy, q } = options;
    await this.findListById(listId, userId);
    if (sortBy && sortBy.split(':').length !== 2) {
      throw new ValidationError([
        { field: 'sortBy', message: 'Invalid sort format.' },
      ]);
    }
    const { from, to } = this._getPagination(page, limit);
    const {
      data: words,
      error,
      count,
    } = await vocabularyModel.searchInList(listId, { q, sortBy, from, to });
    if (error) throw error;
    return { words, pagination: this._formatPagination(page, limit, count) };
  }

  async generateExample(wordId, userId, context = null) {
    await this._verifyWordPermission(wordId, userId, 'write');

    const { data: word, error } = await vocabularyModel.findById(wordId);
    if (error || !word) throw new Error('Word not found');

    if (!aiService.isAvailable()) {
      throw new Error('AI service is temporarily unavailable');
    }

    try {
      const example = await aiService.generateExample(
        word.term,
        word.definition,
        context
      );

      await vocabularyModel.upsertExample(wordId, {
        exampleSentence: example,
        aiGenerated: true,
      });

      return {
        wordId,
        term: word.term,
        example,
      };
    } catch (error) {
      logger.error(`Failed to generate example for word ${wordId}:`, error);
      throw new Error('Failed to generate example sentence. Please try again.');
    }
  }

  async generateExampleForNewWord(term, definition, context = null) {
    if (!aiService.isAvailable()) {
      throw new Error('AI service is temporarily unavailable');
    }

    try {
      const example = await aiService.generateExample(term, definition, context);
      const generationPrompt = `Generate example for "${term}" (${definition})${context ? ` in context: ${context}` : ''}`;

      return {
        term: term,
        example,
        aiGenerated: true,
        generationPrompt: generationPrompt,
      };
    } catch (error) {
      logger.error(`Failed to generate example for new word ${term}:`, error);
      throw new Error('Failed to generate example sentence. Please try again.');
    }
  }

  // =================================================================
  //  SYNONYMS
  // =================================================================

  async addSynonyms(wordId, synonyms, userId) {
    await this._verifyWordPermission(wordId, userId);
    if (!synonyms || !Array.isArray(synonyms) || synonyms.length === 0) {
      throw new ValidationError([
        {
          field: 'synonyms',
          message: 'Synonyms must be a non-empty array of strings.',
        },
      ]);
    }
    const synonymsToInsert = synonyms.map((s) => ({
      word_id: wordId,
      synonym: s.trim(),
    }));
    const { error } = await vocabularyModel.createSynonyms(synonymsToInsert);
    if (error) throw error;
    return { wordId, addedCount: synonyms.length, synonymsAdded: synonyms };
  }

  async deleteSynonym(wordId, synonym, userId) {
    await this._verifyWordPermission(wordId, userId);
    const { error } = await vocabularyModel.deleteSynonym(wordId, synonym);
    if (error) throw error;
  }

  // =================================================================
  //  TAGS
  // =================================================================

  async findAllTags() {
    const { data, error } = await vocabularyModel.findAllTags();
    if (error) throw error;
    return data.map((tag) => tag.name);
  }

  // =================================================================
  //  PRIVATE HELPER METHODS
  // =================================================================

  async _verifyListOwnership(listId, userId) {
    const { data: list, error } = await vocabularyModel.findListOwner(listId);
    if (error || !list) throw new Error('List not found.');
    if (list.creator_id !== userId) throw new ForbiddenError();
  }

  async _verifyWordPermission(wordId, userId, accessType = 'write') {
    const { data: word, error } = await vocabularyModel.findWordWithListInfo(wordId);
    if (error || !word) throw new Error('Word not found.');
    if (accessType === 'read' && word.vocab_lists.privacy_setting === 'public') {
      return word.list_id;
    }
    if (word.vocab_lists.creator_id !== userId) throw new ForbiddenError();
    return word.list_id;
  }

  async _verifyExamplePermission(exampleId, userId) {
    const { data: example, error } =
      await vocabularyModel.findExampleWithListInfo(exampleId);
    if (error || !example) throw new Error('Example not found.');
    if (example.vocabulary.vocab_lists.creator_id !== userId)
      throw new ForbiddenError();
  }

  async _validateAndGetTagIds(tagNames) {
    if (!tagNames || tagNames.length === 0) return [];
    const { data: existingTags, error } =
      await vocabularyModel.findTagsByName(tagNames);
    if (error) throw error;
    if (existingTags.length !== tagNames.length) {
      const found = existingTags.map((t) => t.name);
      const invalid = tagNames.filter((name) => !found.includes(name));
      throw new ValidationError([
        { field: 'tags', message: `Invalid tags: ${invalid.join(', ')}` },
      ]);
    }
    return existingTags.map((t) => t.id);
  }

  _prepareBulkWords(listId, words, userId) {
    const wordsToInsert = [];
    const errors = [];
    words.forEach((word, index) => {
      if (word.term && word.definition) {
        wordsToInsert.push({
          list_id: listId,
          term: word.term,
          definition: word.definition,
          translation: word.translation,
          phonetics: word.phonetics,
          image_url: word.image_url,
          created_by: userId,
        });
      } else {
        errors.push({
          itemIndex: index,
          term: word.term || 'N/A',
          reason: 'Term and definition are required fields.',
        });
      }
    });
    return { wordsToInsert, errors };
  }

  _mapSubItemsToNewWords(originalWords, newWords, itemType) {
    const itemsToInsert = [];
    originalWords.forEach((originalWord) => {
      const newWord = newWords.find((nw) => nw.term === originalWord.term);
      if (!newWord) return;

      if (itemType === 'example' && originalWord.exampleSentence) {
        const exampleData = {
          vocabulary_id: newWord.id,
          example_sentence: originalWord.exampleSentence,
          ai_generated: originalWord.aiGenerated || false,
          generation_prompt: originalWord.generationPrompt || null,
        };
        console.log(
          `Creating example for word "${originalWord.term}":`,
          exampleData
        );
        itemsToInsert.push(exampleData);
      }
      if (itemType === 'synonym' && originalWord.synonyms) {
        originalWord.synonyms.forEach((synonym) => {
          itemsToInsert.push({ word_id: newWord.id, synonym: synonym.trim() });
        });
      }
    });
    return itemsToInsert;
  }

  _getPagination(page, size) {
    if (page == null || size == null) {
      return { from: null, to: null, limit: null };
    }

    const limit = +size; 
    const from = (page - 1) * limit;
    const to = from + size - 1;
    return { from, to, limit };
  }

  _formatPagination(page, limit, totalItems) {
    if (page == null || limit == null) {
      return { totalItems: totalItems || 0 };
    }

    const currentPage = Number(page);
    const totalPages = Math.ceil(totalItems / limit);
    return {
      currentPage,
      totalPages,
      totalItems: totalItems || 0,
      limit: Number(limit),
    };
  }
}

module.exports = new VocabularyService();
