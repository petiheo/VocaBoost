const vocabularyModel = require('../models/vocabulary.model');

class ForbiddenError extends Error {
  /* ... */
}
class ValidationError extends Error {
  /* ... */
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
    const { page = 1, limit = 20 } = options;
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
    const { page = 1, limit = 20 } = options;
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

    list.tags = list.tags.map((t) => t.name);
    return list;
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

    const { term, definition, phonetics, image_url, exampleSentence, translation } =
      wordData;

    const { data: newWord, error } = await vocabularyModel.createWord({
      list_id: listId,
      term,
      definition,
      phonetics,
      image_url,
      created_by: userId,
    });
    if (error) throw error;

    if (exampleSentence) {
      await vocabularyModel.upsertExample(newWord.id, {
        exampleSentence,
        translation,
      });
    }

    await vocabularyModel.updateWordCount(listId);
    return newWord;
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

    const examplesToInsert = [];
    words.forEach((originalWord, index) => {
      const newWord = newWords.find(
        (nw) => nw.term === originalWord.term && nw.list_id === listId
      );

      if (originalWord.exampleSentence && newWord) {
        examplesToInsert.push({
          vocabulary_id: newWord.id,
          example_sentence: originalWord.exampleSentence,
          translation: originalWord.translation,
        });
      }
    });

    if (examplesToInsert.length > 0) {
      const { error: exampleError } =
        await vocabularyModel.createExamplesBulk(examplesToInsert);
      if (exampleError) {
        console.error('Bulk example creation failed:', exampleError);
      }
    }

    await vocabularyModel.updateWordCount(listId);

    return { createdCount: newWords.length, failedCount: errors.length, errors };
  }

  async updateWord(wordId, userId, updateData) {
    await this._verifyWordPermission(wordId, userId);

    const { term, definition, phonetics, image_url, exampleSentence, translation } =
      updateData;

    const wordFieldsToUpdate = { term, definition, phonetics, image_url };

    const cleanedWordUpdates = Object.fromEntries(
      Object.entries(wordFieldsToUpdate).filter(([_, v]) => v !== undefined)
    );

    if (Object.keys(cleanedWordUpdates).length > 0) {
      const { error } = await vocabularyModel.updateWord(wordId, cleanedWordUpdates);
      if (error) throw error;
    }

    if (exampleSentence !== undefined) {
      if (exampleSentence) {
        await vocabularyModel.upsertExample(wordId, {
          exampleSentence,
          translation,
        });
      } else {
        await vocabularyModel.deleteExample(wordId);
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

  async findWordsByListId(listId, userId, { page = 1, limit = 25 }) {
    await this.findListById(listId, userId); // Use existing method for permission check
    const { from, to } = this._getPagination(page, limit);
    const {
      data: words,
      error,
      count,
    } = await vocabularyModel.findWordsByListId(listId, from, to);

    if (error) throw error;
    return { words, pagination: this._formatPagination(page, limit, count) };
  }

  async searchWordsInList(listId, userId, options) {
    const { page = 1, limit = 20, sortBy, q } = options;

    await this.findListById(listId, userId);

    if (sortBy && sortBy.split(':').length !== 2) {
      throw new ValidationError([
        {
          field: 'sortBy',
          message: "Invalid sort format. Use 'field:direction' (e.g., term:asc).",
        },
      ]);
    }

    const { from, to } = this._getPagination(page, limit);
    const {
      data: words,
      error,
      count,
    } = await vocabularyModel.searchInList(listId, {
      q,
      sortBy,
      from,
      to,
    });

    if (error) throw error;

    return {
      words,
      pagination: this._formatPagination(page, limit, count),
    };
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

  _getPagination(page, size) {
    const limit = size ? +size : 20;
    const from = page ? (page - 1) * limit : 0;
    const to = page ? from + size - 1 : size - 1;
    return { from, to };
  }

  _formatPagination(page, limit, totalItems) {
    const currentPage = Number(page);
    const totalPages = Math.ceil(totalItems / limit);
    return { currentPage, totalPages, totalItems, limit: Number(limit) };
  }
}

module.exports = new VocabularyService();
