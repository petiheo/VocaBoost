const supabase = require('../config/database');

/**
 * Custom error class for permission-denied errors.
 * The controller will catch this and return a 403 Forbidden status.
 */
class ForbiddenError extends Error {
  constructor(message = 'User does not have permission for this action.') {
    super(message);
    this.name = 'ForbiddenError';
    this.isForbidden = true;
  }
}

/**
 * Custom error class for validation errors.
 * The controller will catch this and return a 400 Bad Request status.
 */
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

  /**
   * Creates a new vocabulary list and associates it with PRE-EXISTING tags.
   * @param {object} listData - The data for the new list.
   * @param {string} listData.title - The title of the list.
   * @param {string} listData.description - The description of the list.
   * @param {string} listData.privacy_setting - 'public' or 'private'.
   * @param {string[]} listData.tags - An array of existing tag names.
   * @param {string} creatorId - The UUID of the user creating the list.
   * @returns {Promise<object>} The newly created list object.
   */
  async createList(listData, creatorId) {
    const { title, description, privacy_setting, tags = [] } = listData;

    // The validator has already checked the inputs, so we can call the RPC directly.
    const { data, error } = await supabase
      .rpc('create_list_with_tags', {
        p_title: title,
        p_description: description,
        p_privacy_setting: privacy_setting,
        p_creator_id: creatorId,
        p_tags: tags
      })
      .select('*, tags(name)') // Also fetch the associated tags
      .single();

    if (error) {
        // If the error message is about a non-existent tag, we can format it nicely.
        if (error.message.includes('does not exist')) {
            throw new ValidationError([{
                field: 'tags',
                message: error.message
            }]);
        }
        // For other errors, re-throw them.
        throw error;
    }
    
    // The RPC returns a full list object, so we just format the tags.
    data.tags = data.tags.map(t => t.name);
    return data;
  }

  // ... (findUserLists and searchPublicLists remain the same) ...
  async findUserLists(userId, { q, privacy, sortBy, page = 1, limit = 20 }) {
    let query = supabase
      .from('vocab_lists')
      .select('id, title, privacy_setting, word_count, updated_at, tags(name)', { count: 'exact' })
      .eq('creator_id', userId);

    if (q) {
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
    }
    if (privacy && ['public', 'private'].includes(privacy)) {
      query = query.eq('privacy_setting', privacy);
    }
    if (sortBy) {
        const [field, direction] = sortBy.split(':');
        const ascending = direction === 'asc';
        if (['title', 'updated_at', 'word_count'].includes(field)) {
            query = query.order(field, { ascending });
        }
    } else {
        query = query.order('updated_at', { ascending: false });
    }

    const { from, to } = this._getPagination(page, limit);
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;
    
    const lists = data.map(list => ({ ...list, tags: list.tags.map(t => t.name) }));

    return {
      lists,
      pagination: this._formatPagination(page, limit, count),
    };
  }

  async searchPublicLists({ q, tags, sortBy, page = 1, limit = 20 }) {
    let query = supabase
      .from('vocab_lists')
      .select('id, title, description, word_count, updated_at, creator:users(id, display_name, role), tags(name)', { count: 'exact' })
      .eq('privacy_setting', 'public')
      .eq('is_active', true);
      
    if (q) {
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
    }
    if (tags) {
      const tagArray = tags.split(',').map(t => t.trim());
      query = query.in('tags.name', tagArray);
    }
    if (sortBy) {
        const [field, direction] = sortBy.split(':');
        const ascending = direction === 'asc';
        if (['title', 'updated_at', 'word_count'].includes(field)) {
            query = query.order(field, { ascending });
        }
    } else {
        query = query.order('word_count', { ascending: false });
    }

    const { from, to } = this._getPagination(page, limit);
    query = query.range(from, to);
    
    const { data, error, count } = await query;
    if (error) throw error;

    const lists = data.map(list => ({ ...list, tags: list.tags.map(t => t.name) }));

    return {
      lists,
      pagination: this._formatPagination(page, limit, count),
    };
  }

  async findListById(listId, userId, skipPermissionCheck = false) {
    const { data: list, error } = await supabase
        .from('vocab_lists')
        .select('*, creator:users(id, display_name, role), tags(name)')
        .eq('id', listId)
        .single();
    
    if (error || !list) {
        return null;
    }

    if (!skipPermissionCheck && list.privacy_setting === 'private' && list.creator_id !== userId) {
        throw new ForbiddenError('You do not have permission to view this private list.');
    }
    
    list.tags = list.tags.map(t => t.name);
    return list;
  }
  
  /**
   * Updates a vocabulary list's details, using only PRE-EXISTING tags.
   * @param {string} listId - The UUID of the list to update.
   * @param {string} userId - The UUID of the user performing the update.
   * @param {object} updateData - An object with the fields to update.
   * @returns {Promise<object>} The updated list object.
   */
  async updateList(listId, userId, updateData) {
    await this._verifyListOwnership(listId, userId);

    const { title, description, privacy_setting, tags } = updateData;
    const allowedUpdates = { title, description, privacy_setting };

    // --- Start of Changed Logic ---
    if(tags) {
        // Step 1: Validate tags exist and get their IDs.
        const tagIds = await this._validateAndGetTagIds(tags);

        // Step 2: Overwrite the existing tag associations for this list.
        // It's simpler to delete all and then re-insert the new set.
        await supabase.from('list_tags').delete().eq('list_id', listId);

        if (tagIds.length > 0) {
            const listTagRelations = tagIds.map(tagId => ({
                list_id: listId,
                tag_id: tagId,
            }));
            const { error: tagsError } = await supabase.from('list_tags').insert(listTagRelations);
            if(tagsError) throw tagsError;
        }
    }
    // --- End of Changed Logic ---

    const { data: updatedList, error } = await supabase
        .from('vocab_lists')
        .update(allowedUpdates)
        .eq('id', listId)
        .select('id, title, privacy_setting, updated_at, tags(name)')
        .single();
    
    if (error) throw error;
    
    updatedList.tags = updatedList.tags.map(t => t.name);
    return updatedList;
  }

  // ... (deleteList and all word-related methods remain the same) ...
  async deleteList(listId, userId) {
    await this._verifyListOwnership(listId, userId);
    const { error } = await supabase.from('vocab_lists').delete().eq('id', listId);
    if (error) throw error;
  }

  async createWord(listId, wordData, userId) {
    await this._verifyListOwnership(listId, userId);
    
    const { term, definition, phonetics } = wordData;
    const { data: newWord, error } = await supabase
      .from('vocabulary')
      .insert({
        list_id: listId,
        term,
        definition,
        phonetics,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw error;
    await this._updateWordCount(listId);
    return newWord;
  }
  
  async createWordsBulk(listId, words, userId) {
    await this._verifyListOwnership(listId, userId);
    
    const wordsToInsert = [];
    const errors = [];
    
    words.forEach((word, index) => {
        if (word.term && word.definition) {
            wordsToInsert.push({
                list_id: listId,
                term: word.term,
                definition: word.definition,
                phonetics: word.phonetics,
                created_by: userId
            });
        } else {
            errors.push({
                itemIndex: index,
                term: word.term || 'N/A',
                reason: 'Term and definition are required fields.'
            });
        }
    });

    if (wordsToInsert.length > 0) {
        const { error: insertError } = await supabase.from('vocabulary').insert(wordsToInsert);
        if (insertError) throw insertError;
    }
    
    await this._updateWordCount(listId);

    return {
        createdCount: wordsToInsert.length,
        failedCount: errors.length,
        errors,
    };
  }

  async updateWord(wordId, userId, updateData) {
    await this._verifyWordPermission(wordId, userId);
    const { term, definition, phonetics } = updateData;

    const { data: updatedWord, error } = await supabase
      .from('vocabulary')
      .update({ term, definition, phonetics })
      .eq('id', wordId)
      .select('id, term, definition, updated_at')
      .single();
      
    if (error) throw error;
    return updatedWord;
  }

  async deleteWord(wordId, userId) {
    const listId = await this._verifyWordPermission(wordId, userId);
    const { error } = await supabase.from('vocabulary').delete().eq('id', wordId);
    if (error) throw error;
    await this._updateWordCount(listId);
  }

  async findWordsByListId(listId, userId, { page = 1, limit = 25 }) {
    const list = await this.findListById(listId, userId);
    if (!list) return null; // findListById handles permissions
    
    const query = supabase
      .from('vocabulary')
      .select('id, term, definition, phonetics, created_at', { count: 'exact' })
      .eq('list_id', listId)
      .order('created_at', { ascending: true });

    const { from, to } = this._getPagination(page, limit);
    const { data: words, error, count } = await query.range(from, to);

    if (error) throw error;
    
    return {
      words,
      pagination: this._formatPagination(page, limit, count),
    };
  }
  
  async findAllTags() {
    const { data, error } = await supabase
        .from('tags')
        .select('name')
        .order('name', { ascending: true });
        
    if (error) throw error;
    return data.map(tag => tag.name);
  }

  // =================================================================
  //  PRIVATE HELPER METHODS
  // =================================================================

  async _verifyListOwnership(listId, userId) {
    const { data, error } = await supabase
      .from('vocab_lists')
      .select('creator_id')
      .eq('id', listId)
      .single();
    if (error || !data) throw new Error('List not found.');
    if (data.creator_id !== userId) throw new ForbiddenError();
  }
  
  async _verifyWordPermission(wordId, userId) {
      const { data, error } = await supabase
        .from('vocabulary')
        .select('list_id, vocab_lists(creator_id)')
        .eq('id', wordId)
        .single();
        
      if (error || !data) throw new Error('Word not found.');
      if (data.vocab_lists.creator_id !== userId) throw new ForbiddenError();
      return data.list_id;
  }
  
  async _updateWordCount(listId) {
    const { error } = await supabase.rpc('update_list_word_count', { list_id_param: listId });
    if (error) console.error(`Failed to update word count for list ${listId}:`, error);
  }
  
  /**
   * NEW HELPER: Validates that all provided tag names exist in the DB.
   * Throws a ValidationError if any tag is not found.
   * @private
   * @param {string[]} tagNames - An array of tag names to validate.
   * @returns {Promise<number[]>} An array of the corresponding tag IDs.
   */
  async _validateAndGetTagIds(tagNames) {
    if (!tagNames || tagNames.length === 0) {
      return [];
    }
  
    const { data: existingTags, error } = await supabase
      .from('tags')
      .select('id, name')
      .in('name', tagNames);
  
    if (error) throw error;
  
    if (existingTags.length !== tagNames.length) {
      const foundNames = existingTags.map(t => t.name);
      const invalidTags = tagNames.filter(name => !foundNames.includes(name));
      throw new ValidationError([
        {
          field: 'tags',
          message: `One or more tags are invalid. The following tags do not exist: ${invalidTags.join(', ')}`,
        },
      ]);
    }
  
    return existingTags.map(t => t.id);
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