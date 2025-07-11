const supabase = require('../config/database');

/**
 * Custom error class for permission-denied errors.
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

  async createList(listData, creatorId) {
    const { title, description, privacy_setting, tags = [] } = listData;

    const { data, error } = await supabase
      .rpc('create_list_with_tags', {
        p_title: title,
        p_description: description,
        p_privacy_setting: privacy_setting,
        p_creator_id: creatorId,
        p_tags: tags
      })
      .select('*, tags(name)')
      .single();

    if (error) {
        if (error.message.includes('does not exist')) {
            throw new ValidationError([{ field: 'tags', message: error.message }]);
        }
        throw error;
    }
    
    data.tags = data.tags.map(t => t.name);
    return data;
  }

  async findUserLists(userId, { q, privacy, sortBy, page = 1, limit = 20 }) {
    let query = supabase
      .from('vocab_lists')
      .select('id, title, privacy_setting, word_count, updated_at, tags(name)', { count: 'exact' })
      .eq('creator_id', userId);

    if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
    if (privacy) query = query.eq('privacy_setting', privacy);

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
    const { data, error, count } = await query.range(from, to);

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
      
    if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
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
    const { data, error, count } = await query.range(from, to);
    
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
    
    if (error || !list) return null;

    if (!skipPermissionCheck && list.privacy_setting === 'private' && list.creator_id !== userId) {
        throw new ForbiddenError('You do not have permission to view this private list.');
    }
    
    list.tags = list.tags.map(t => t.name);
    return list;
  }
  
  async updateList(listId, userId, updateData) {
    await this._verifyListOwnership(listId, userId);

    const { title, description, privacy_setting, tags } = updateData;
    const allowedUpdates = { title, description, privacy_setting };

    if(tags) {
        const tagIds = await this._validateAndGetTagIds(tags);
        await supabase.from('list_tags').delete().eq('list_id', listId);
        if (tagIds.length > 0) {
            const listTagRelations = tagIds.map(tagId => ({ list_id: listId, tag_id: tagId }));
            const { error: tagsError } = await supabase.from('list_tags').insert(listTagRelations);
            if(tagsError) throw tagsError;
        }
    }

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

  async deleteList(listId, userId) {
    await this._verifyListOwnership(listId, userId);
    const { error } = await supabase.from('vocab_lists').delete().eq('id', listId);
    if (error) throw error;
  }

  // =================================================================
  //  WORDS
  // =================================================================

  async createWord(listId, wordData, userId) {
    await this._verifyListOwnership(listId, userId);
    
    const { term, definition, phonetics, image_url } = wordData;
    const { data: newWord, error } = await supabase
      .from('vocabulary')
      .insert({ list_id: listId, term, definition, phonetics, image_url, created_by: userId })
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
                image_url: word.image_url,
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
    const { term, definition, phonetics, image_url } = updateData;

    const { data: updatedWord, error } = await supabase
      .from('vocabulary')
      .update({ term, definition, phonetics, image_url })
      .eq('id', wordId)
      .select('id, term, definition, image_url, updated_at')
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
    if (!list) return null;
    
    const query = supabase
      .from('vocabulary')
      .select('id, term, definition, phonetics, image_url, created_at', { count: 'exact' })
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

  // =================================================================
  //  EXAMPLES (NEW METHODS)
  // =================================================================

  async addExample(wordId, exampleData, userId) {
    await this._verifyWordPermission(wordId, userId);
    const { exampleSentence, translation } = exampleData;
    
    // Server-side validation
    if (!exampleSentence || exampleSentence.length < 10) {
      throw new ValidationError([{ field: 'exampleSentence', message: 'Example sentence is required and must be at least 10 characters.' }]);
    }

    const { data: newExample, error } = await supabase
      .from('vocabulary_examples')
      .insert({ vocabulary_id: wordId, example_sentence: exampleSentence, translation })
      .select()
      .single();

    if (error) throw error;
    return newExample;
  }

  async getExamplesByWordId(wordId, userId) {
    await this._verifyWordPermission(wordId, userId, 'read');
    const { data, error } = await supabase
      .from('vocabulary_examples')
      .select('*')
      .eq('vocabulary_id', wordId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  async deleteExample(exampleId, userId) {
    await this._verifyExamplePermission(exampleId, userId);
    const { error } = await supabase.from('vocabulary_examples').delete().eq('id', exampleId);
    if (error) throw error;
  }
  
  // =================================================================
  //  SYNONYMS (NEW METHODS)
  // =================================================================

  async addSynonyms(wordId, synonyms, userId) {
    await this._verifyWordPermission(wordId, userId);

    if (!synonyms || !Array.isArray(synonyms) || synonyms.length === 0) {
      throw new ValidationError([{ field: 'synonyms', message: 'Synonyms must be a non-empty array of strings.' }]);
    }

    const synonymsToInsert = synonyms.map(s => ({ word_id: wordId, synonym: s.trim() }));

    // `onConflict` ignores duplicates, so we don't add existing ones.
    const { data, error } = await supabase
      .from('word_synonyms')
      .insert(synonymsToInsert)
      .onConflict('word_id', 'synonym')
      .ignore();
    
    if (error) throw error;

    // To return the added count, we'd need to query before and after, or just return the list.
    // For simplicity, we return what was sent and a success message.
    return {
      wordId: wordId,
      addedCount: synonyms.length, // This is the attempted count, not the actual new count.
      synonymsAdded: synonyms,
    }
  }

  async getSynonymsByWordId(wordId, userId) {
    await this._verifyWordPermission(wordId, userId, 'read');
    const { data, error } = await supabase
      .from('word_synonyms')
      .select('synonym')
      .eq('word_id', wordId);

    if (error) throw error;
    return data.map(s => s.synonym); // Return a simple array of strings
  }

  async deleteSynonym(wordId, synonym, userId) {
    await this._verifyWordPermission(wordId, userId);
    const { error } = await supabase
      .from('word_synonyms')
      .delete()
      .match({ word_id: wordId, synonym: synonym });
      
    if (error) throw error;
  }
  
  // =================================================================
  //  TAGS
  // =================================================================
  
  async findAllTags() {
    const { data, error } = await supabase.from('tags').select('name').order('name');
    if (error) throw error;
    return data.map(tag => tag.name);
  }

  // =================================================================
  //  PRIVATE HELPER METHODS
  // =================================================================

  async _verifyListOwnership(listId, userId) {
    const { data, error } = await supabase
      .from('vocab_lists').select('creator_id').eq('id', listId).single();
    if (error || !data) throw new Error('List not found.');
    if (data.creator_id !== userId) throw new ForbiddenError();
  }
  
  async _verifyWordPermission(wordId, userId, accessType = 'write') {
    const { data, error } = await supabase
      .from('vocabulary').select('list_id, vocab_lists(creator_id, privacy_setting)').eq('id', wordId).single();
    if (error || !data) throw new Error('Word not found.');
    
    if (accessType === 'read' && data.vocab_lists.privacy_setting === 'public') {
      return data.list_id; // Allow read access for public lists
    }
    
    if (data.vocab_lists.creator_id !== userId) throw new ForbiddenError();
    return data.list_id;
  }

  async _verifyExamplePermission(exampleId, userId) {
    const { data, error } = await supabase
      .from('vocabulary_examples').select('vocabulary(id, list_id, vocab_lists(creator_id))').eq('id', exampleId).single();
    
    if (error || !data) throw new Error('Example not found.');
    if (data.vocabulary.vocab_lists.creator_id !== userId) throw new ForbiddenError();
  }
  
  async _updateWordCount(listId) {
    const { error } = await supabase.rpc('update_list_word_count', { list_id_param: listId });
    if (error) console.error(`Failed to update word count for list ${listId}:`, error);
  }
  
  async _validateAndGetTagIds(tagNames) {
    if (!tagNames || tagNames.length === 0) return [];
    const { data: existingTags, error } = await supabase.from('tags').select('id, name').in('name', tagNames);
    if (error) throw error;
    if (existingTags.length !== tagNames.length) {
      const found = existingTags.map(t => t.name);
      const invalid = tagNames.filter(name => !found.includes(name));
      throw new ValidationError([{ field: 'tags', message: `Invalid tags: ${invalid.join(', ')}` }]);
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