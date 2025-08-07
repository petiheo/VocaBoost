const { supabase } = require('../config/supabase.config');
const logger = require('../utils/logger');

class VocabularyModel {
  // =================================================================
  //  LIST MODELS
  // =================================================================
  async findListById(listId) {
    return await supabase
      .from('vocab_lists')
      .select('*, creator:users(id, display_name, role, avatar_url), tags(name)')
      .eq('id', listId)
      .single();
  }

  async findUserLists(userId, options) {
    const { q, privacy, sortBy, from, to } = options;
    let query = supabase
      .from('vocab_lists')
      .select(
        'id, title, description, privacy_setting, word_count, updated_at, tags(name), creator:users(id, display_name, role, avatar_url)',
        { count: 'exact' }
      )
      .eq('creator_id', userId);

    if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
    if (privacy) query = query.eq('privacy_setting', privacy);

    if (sortBy) {
      const [field, direction] = sortBy.split(':');
      query = query.order(field, { ascending: direction === 'asc' });
    } else {
      query = query.order('updated_at', { ascending: false });
    }
    if (from !== null && to !== null) {
      query = query.range(from, to);
    }

    return await query;
  }

  async searchPublicLists(options) {
    const { q, tags, sortBy, from, to } = options;
    let query = supabase
      .from('vocab_lists')
      .select(
        'id, title, description, word_count, updated_at, creator:users(id, display_name, role, avatar_url), tags(name)',
        { count: 'exact' }
      )
      .eq('privacy_setting', 'public')
      .eq('is_active', true);

    if (q) query = query.or(`title.ilike.%${q}%`);
    if (tags) {
      const tagArray = tags.split(',').map((t) => t.trim());
      query = query.in('tags.name', tagArray);
    }
    if (sortBy) {
      const [field, direction] = sortBy.split(':');
      query = query.order(field, { ascending: direction === 'asc' });
    } else {
      query = query.order('word_count', { ascending: false });
    }
    if (from !== null && to !== null) {
      query = query.range(from, to);
    }

    return await query;
  }

  async upsertListHistory(userId, listId) {
    return await supabase.from('user_list_history').upsert(
      {
        user_id: userId,
        list_id: listId,
        last_accessed_at: new Date().toISOString(),
      },
      { onConflict: 'user_id, list_id' }
    );
  }

  async findHistoryLists(userId, from, to) {
    let query = supabase
      .from('user_list_history')
      .select(
        `
        last_accessed_at,
        list:vocab_lists (
            id,
            title,
            description,
            word_count,
            privacy_setting,
            created_at,
            creator:users (id, display_name, role, avatar_url),
            tags (name)
        )
      `,
        { count: 'exact' }
      )
      .eq('user_id', userId)
      .order('last_accessed_at', { ascending: false });

    if (from !== null && to !== null) {
      query = query.range(from, to);
    }

    return await query.then(({ data, error, count }) => {
      if (error) return { data, error, count };
      if (data) {
        const reshapedData = data
          .map((item) => {
            if (!item.list) return null;
            return {
              ...item.list,
              tags: item.list.tags.map((t) => t.name),
              last_accessed_at: item.last_accessed_at,
            };
          })
          .filter(Boolean);
        return { data: reshapedData, error, count };
      }
      return { data: [], error, count };
    });
  }

  async findPopularLists(from, to) {
    let query = supabase
      .from('vocab_lists')
      .select(
        `
        id,
        title,
        description,
        word_count,
        privacy_setting,
        created_at,
        view_count,
        creator:users (id, display_name, role, avatar_url),
        tags (name)
      `,
        { count: 'exact' }
      )
      .eq('privacy_setting', 'public')
      .eq('is_active', true)
      .order('view_count', { ascending: false });

    if (from !== null && to !== null) {
      query = query.range(from, to);
    }

    return await query.then(({ data, error, count }) => {
      if (error) return { data, error, count };
      if (data) {
        const reshapedData = data.map((item) => ({
          ...item,
          tags: item.tags.map((t) => t.name),
        }));
        return { data: reshapedData, error, count };
      }
      return { data: [], error, count };
    });
  }

  async updateList(listId, updateData) {
    return await supabase
      .from('vocab_lists')
      .update(updateData)
      .eq('id', listId)
      .select('id, title, privacy_setting, updated_at, tags(name)')
      .single();
  }

  async deleteList(listId) {
    return await supabase.from('vocab_lists').delete().eq('id', listId);
  }

  async findListOwner(listId) {
    return await supabase
      .from('vocab_lists')
      .select('creator_id')
      .eq('id', listId)
      .single();
  }

  // =================================================================
  //  WORD MODELS
  // =================================================================
  async createWord(wordData) {
    return await supabase.from('vocabulary').insert(wordData).select().single();
  }

  async createWordsBulkAndReturn(wordsToInsert) {
    return await supabase.from('vocabulary').insert(wordsToInsert).select();
  }

  async findWordWithListInfo(wordId) {
    const { data, error } = await supabase
      .from('vocabulary')
      .select(
        `
        list_id,
        vocab_lists (
          creator_id,
          privacy_setting
        )
      `
      )
      .eq('id', wordId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { data: null, error: null };
      }
      return { data: null, error };
    }

    if (!data.vocab_lists) {
      // This is a data integrity issue (a word exists without a list),
      // but we handle it safely by treating the word as inaccessible.
      logger.error(`Data integrity issue: Word ${wordId} has no associated list.`);
      return { data: null, error: new Error('Word has no associated list.') };
    }

    return { data, error: null };
  }

  // =================================================================
  //  PRIVATE HELPER METHODS FOR VOCABULARY QUERIES
  // =================================================================

  /**
   * Configuration for vocabulary-related queries
   */
  _getQueryConfig() {
    return {
      examplesSelect:
        'vocabulary_id, example_sentence, ai_generated, generation_prompt, created_at',
      synonymsSelect: 'word_id, synonym, created_at',
      vocabularySelect: '*',
      foreignKeys: {
        examples: 'fk_vocabulary_examples_vocabulary_id',
        synonyms: 'fk_word_synonyms_word_id',
      },
      nestedSelect: `
        *,
        vocabulary_examples!fk_vocabulary_examples_vocabulary_id (
          vocabulary_id,
          example_sentence,
          ai_generated,
          generation_prompt,
          created_at
        ),
        word_synonyms!fk_word_synonyms_word_id (
          word_id,
          synonym,
          created_at
        )
      `,
    };
  }

  /**
   * Build base Supabase query with common configurations
   */
  _buildBaseQuery(tableName, options = {}) {
    const config = this._getQueryConfig();
    return supabase.from(tableName).select(config.vocabularySelect, options);
  }

  /**
   * Apply pagination to a query if pagination parameters are provided
   */
  _applyPagination(query, from, to) {
    if (from !== null && to !== null) {
      return query.range(from, to);
    }
    return query;
  }

  /**
   * Execute nested query with FK relationships
   */
  async _executeNestedQuery(baseQuery, context) {
    const config = this._getQueryConfig();

    // Build new query with nested select (we know the table is 'vocabulary')
    let nestedQuery = supabase
      .from('vocabulary')
      .select(
        config.nestedSelect,
        { count: 'exact' }
      );

    // Apply the same filters from base query
    if (context.listId) {
      nestedQuery = nestedQuery.eq('list_id', context.listId);
    }
    if (context.wordIds) {
      nestedQuery = nestedQuery.in('id', context.wordIds);
    }

    // Apply pagination if needed
    if (context.pagination) {
      nestedQuery = this._applyPagination(
        nestedQuery,
        context.pagination.from,
        context.pagination.to
      );
    }

    // Apply ordering for list queries
    if (context.method === 'findWordsByListId') {
      nestedQuery = nestedQuery.order('created_at', { ascending: true });
    }

    const result = await nestedQuery;

    if (result.error) {
      throw new Error(`Nested query failed: ${result.error.message}`);
    }

    return result;
  }

  /**
   * Execute parallel queries as fallback
   */
  async _executeParallelQueries(baseQuery, context) {
    const config = this._getQueryConfig();

    // Execute main vocabulary query
    const mainResult = await baseQuery;

    if (mainResult.error) {
      throw new Error(`Main query failed: ${mainResult.error.message}`);
    }

    if (!mainResult.data || mainResult.data.length === 0) {
      return { data: [], count: 0, error: null };
    }

    // Extract word IDs for related data queries
    const wordIds = mainResult.data.map((word) => word.id);

    // Execute examples and synonyms queries in parallel
    const [examplesResult, synonymsResult] = await Promise.all([
      supabase
        .from('vocabulary_examples')
        .select(config.examplesSelect)
        .in('vocabulary_id', wordIds),
      supabase
        .from('word_synonyms')
        .select(config.synonymsSelect)
        .in('word_id', wordIds),
    ]);

    if (examplesResult.error) {
      throw new Error(`Examples query failed: ${examplesResult.error.message}`);
    }

    if (synonymsResult.error) {
      throw new Error(`Synonyms query failed: ${synonymsResult.error.message}`);
    }

    return {
      data: mainResult.data,
      count: mainResult.count,
      error: null,
      examples: examplesResult.data || [],
      synonyms: synonymsResult.data || [],
    };
  }

  /**
   * Execute query with fallback strategy
   */
  async _executeWithFallback(nestedQueryFn, parallelQueryFn, context) {
    try {
      // Try nested query first
      return await nestedQueryFn();
    } catch (nestedError) {
      logger.warn(
        `Nested query failed for ${context.method}, falling back to parallel queries`,
        {
          error: nestedError.message,
          context,
        }
      );

      // Fallback to parallel queries
      return await parallelQueryFn();
    }
  }

  /**
   * Build lookup maps for efficient data assembly
   */
  _buildLookupMaps(examples, synonyms) {
    const examplesMap = new Map();
    const synonymsMap = new Map();

    // Build examples map
    (examples || []).forEach((example) => {
      if (!examplesMap.has(example.vocabulary_id)) {
        examplesMap.set(example.vocabulary_id, []);
      }
      examplesMap.get(example.vocabulary_id).push(example);
    });

    // Build synonyms map
    (synonyms || []).forEach((synonym) => {
      if (!synonymsMap.has(synonym.word_id)) {
        synonymsMap.set(synonym.word_id, []);
      }
      synonymsMap.get(synonym.word_id).push(synonym.synonym);
    });

    return { examplesMap, synonymsMap };
  }

  /**
   * Process vocabulary words with their related data
   */
  _enrichWords(words, examplesMap, synonymsMap, format = 'list') {
    return words.map((word) => {
      // Handle nested query results
      if (
        word.vocabulary_examples !== undefined ||
        word.word_synonyms !== undefined
      ) {
        return this._enrichWordsFromNested(word, format);
      }

      // Handle parallel query results
      return this._enrichWordsFromMaps(word, examplesMap, synonymsMap, format);
    });
  }

  /**
   * Enrich word data from nested query results
   */
  _enrichWordsFromNested(word, format) {
    const examples = word.vocabulary_examples || [];
    const synonyms = word.word_synonyms
      ? word.word_synonyms.map((s) => s.synonym)
      : [];

    // Remove the nested properties to avoid duplication
    const cleanWord = { ...word };
    delete cleanWord.vocabulary_examples;
    delete cleanWord.word_synonyms;

    if (format === 'list') {
      // For list queries: return single example for backward compatibility
      return {
        ...cleanWord,
        vocabulary_examples: examples.length > 0 ? examples[0] : null,
        synonyms,
      };
    } else {
      // For IDs queries: return all examples
      return {
        ...cleanWord,
        examples,
        synonyms,
      };
    }
  }

  /**
   * Enrich word data using lookup maps
   */
  _enrichWordsFromMaps(word, examplesMap, synonymsMap, format) {
    const wordExamples = examplesMap.get(word.id) || [];
    const wordSynonyms = synonymsMap.get(word.id) || [];

    if (format === 'list') {
      // For list queries: return single example for backward compatibility
      return {
        ...word,
        vocabulary_examples: wordExamples.length > 0 ? wordExamples[0] : null,
        synonyms: wordSynonyms,
      };
    } else {
      // For IDs queries: return all examples
      return {
        ...word,
        examples: wordExamples,
        synonyms: wordSynonyms,
      };
    }
  }

  /**
   * Format result for findWordsByListId
   */
  _formatListResult(result, context) {
    if (result.error) {
      return { data: null, error: result.error, count: 0 };
    }

    if (!result.data || result.data.length === 0) {
      return { data: [], error: null, count: result.count || 0 };
    }

    // Handle nested query results
    if (result.data[0]?.vocabulary_examples !== undefined) {
      const enrichedWords = this._enrichWords(result.data, null, null, 'list');
      return {
        data: enrichedWords,
        error: null,
        count: result.count || enrichedWords.length,
      };
    }

    // Handle parallel query results
    const { examplesMap, synonymsMap } = this._buildLookupMaps(
      result.examples,
      result.synonyms
    );
    const enrichedWords = this._enrichWords(
      result.data,
      examplesMap,
      synonymsMap,
      'list'
    );

    return {
      data: enrichedWords,
      error: null,
      count: result.count || enrichedWords.length,
    };
  }

  /**
   * Format result for findWordsByIds
   */
  _formatIdsResult(result, context) {
    if (result.error) {
      return { data: null, error: result.error };
    }

    if (!result.data || result.data.length === 0) {
      return { data: [], error: null };
    }

    // Handle nested query results
    if (result.data[0]?.vocabulary_examples !== undefined) {
      const enrichedWords = this._enrichWords(result.data, null, null, 'ids');
      return { data: enrichedWords, error: null };
    }

    // Handle parallel query results
    const { examplesMap, synonymsMap } = this._buildLookupMaps(
      result.examples,
      result.synonyms
    );
    const enrichedWords = this._enrichWords(
      result.data,
      examplesMap,
      synonymsMap,
      'ids'
    );

    return { data: enrichedWords, error: null };
  }

  /**
   * Handle errors with consistent logging and formatting
   */
  _handleError(error, context) {
    const errorMessage = `Error in ${context.method}`;
    const errorDetails = {
      method: context.method,
      error: error.message,
      stack: error.stack,
      context,
    };

    logger.error(errorMessage, errorDetails);

    // Return appropriate error format based on method
    if (context.method === 'findWordsByListId') {
      return { data: null, error, count: 0 };
    } else {
      return { data: null, error };
    }
  }

  // =================================================================
  //  PUBLIC VOCABULARY QUERY METHODS
  // =================================================================

  async findWordsByListId(listId, from, to) {
    const context = {
      method: 'findWordsByListId',
      listId,
      pagination: { from, to },
    };

    try {
      // Build base query with filters and pagination
      const baseQuery = this._buildBaseQuery('vocabulary', { count: 'exact' })
        .eq('list_id', listId)
        .order('created_at', { ascending: true });

      const query = this._applyPagination(baseQuery, from, to);

      // Try nested query first, fallback to parallel queries
      const result = await this._executeWithFallback(
        () => this._executeNestedQuery(query, context),
        () => this._executeParallelQueries(query, context),
        context
      );

      return this._formatListResult(result, context);
    } catch (error) {
      return this._handleError(error, context);
    }
  }

  async findWordsByIds(wordIds) {
    const context = { method: 'findWordsByIds', wordIds };

    try {
      // Validate input
      if (!Array.isArray(wordIds) || wordIds.length === 0) {
        return { data: [], error: null };
      }

      // Build base query for word IDs
      const baseQuery = this._buildBaseQuery('vocabulary').in('id', wordIds);

      // Try nested query first, fallback to parallel queries
      const result = await this._executeWithFallback(
        () => this._executeNestedQuery(baseQuery, context),
        () => this._executeParallelQueries(baseQuery, context),
        context
      );

      return this._formatIdsResult(result, context);
    } catch (error) {
      return this._handleError(error, context);
    }
  }

  async searchInList(listId, options) {
    const { q, sortBy, from, to } = options;
    try {
      // Step 1: Build the base search query without pagination.
      let query = supabase
        .from('vocabulary')
        .select('*', { count: 'exact' })
        .eq('list_id', listId)
        .or(`term.ilike.%${q}%,definition.ilike.%${q}%`);

      if (sortBy) {
        const [field, direction] = sortBy.split(':');
        if (['term', 'created_at'].includes(field)) {
          query = query.order(field, { ascending: direction === 'asc' });
        }
      } else {
        query = query.order('created_at', { ascending: true });
      }

      if (from !== null && to !== null) {
        query = query.range(from, to);
      }

      // Execute the query
      const { data: words, error: wordsError, count } = await query;

      if (wordsError) throw wordsError;
      if (!words || words.length === 0) {
        return { data: [], error: null, count: 0 };
      }

      // Step 2: Get all the IDs of the words we just fetched.
      const wordIds = words.map((word) => word.id);

      // Step 3: Fetch all examples for those specific words.
      const { data: examples, error: examplesError } = await supabase
        .from('vocabulary_examples')
        .select('*')
        .in('vocabulary_id', wordIds);
      if (examplesError) throw examplesError;

      // Step 4: Fetch all synonyms for those specific words.
      const { data: synonyms, error: synonymsError } = await supabase
        .from('word_synonyms')
        .select('word_id, synonym')
        .in('word_id', wordIds);
      if (synonymsError) throw synonymsError;

      // Step 5: Map the examples and synonyms to their parent words.
      const examplesMap = new Map(examples.map((ex) => [ex.vocabulary_id, ex]));
      const synonymsMap = new Map();
      synonyms.forEach((s) => {
        if (!synonymsMap.has(s.word_id)) {
          synonymsMap.set(s.word_id, []);
        }
        synonymsMap.get(s.word_id).push(s.synonym);
      });

      // Step 6: Assemble the final, complete word objects.
      const enrichedWords = words.map((word) => ({
        ...word,
        vocabulary_examples: examplesMap.get(word.id) || null,
        synonyms: synonymsMap.get(word.id) || [],
      }));

      return { data: enrichedWords, error: null, count };
    } catch (error) {
      logger.error(
        `Error in searchInList for list ${listId} with query "${q}":`,
        error
      );
      return { data: null, error, count: 0 };
    }
  }

  async updateWord(wordId, updateData) {
    return await supabase
      .from('vocabulary')
      .update(updateData)
      .eq('id', wordId)
      .select()
      .single();
  }

  async deleteWord(wordId) {
    return await supabase.from('vocabulary').delete().eq('id', wordId);
  }

  async findById(id) {
    try {
      // Step 1: Fetch the basic word information from the 'vocabulary' table.
      const { data: wordData, error: wordError } = await supabase
        .from('vocabulary')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (wordError) throw wordError;
      if (!wordData) return { data: null, error: null }; // Word not found

      // Step 2: Fetch the associated example sentence from its own table.
      const { data: exampleData, error: exampleError } = await supabase
        .from('vocabulary_examples')
        .select('*')
        .eq('vocabulary_id', id)
        .maybeSingle();

      if (exampleError) throw exampleError;

      // Step 3: Fetch all associated synonyms from their own table.
      const { data: synonymsData, error: synonymsError } = await supabase
        .from('word_synonyms')
        .select('synonym')
        .eq('word_id', id);

      if (synonymsError) throw synonymsError;

      // Step 4: Assemble the final, complete word object.
      const finalWordObject = {
        ...wordData,
        vocabulary_examples: exampleData, // This will be the example object or null
        synonyms: synonymsData ? synonymsData.map((s) => s.synonym) : [], // Format into a simple array
      };

      return { data: finalWordObject, error: null };
    } catch (error) {
      // Catch any database error from the three steps and return it.
      logger.error(`Error in findById for word ${id}:`, error);
      return { data: null, error };
    }
  }

  // =================================================================
  //  EXAMPLE MODELS
  // =================================================================
  async createExamplesBulk(examplesToInsert) {
    return await supabase.from('vocabulary_examples').insert(examplesToInsert);
  }

  async upsertExample(wordId, exampleData) {
    return await supabase
      .from('vocabulary_examples')
      .upsert({
        vocabulary_id: wordId,
        example_sentence: exampleData.exampleSentence,
        ai_generated: exampleData.aiGenerated || false,
        generation_prompt: exampleData.generationPrompt || null,
      })
      .select()
      .single();
  }

  async deleteExample(wordId) {
    return await supabase
      .from('vocabulary_examples')
      .delete()
      .eq('vocabulary_id', wordId);
  }

  // =================================================================
  //  SYNONYM MODELS
  // =================================================================
  async createSynonyms(synonymsToInsert) {
    return await supabase.from('word_synonyms').upsert(synonymsToInsert);
  }

  async deleteSynonymsByWordId(wordId) {
    return await supabase.from('word_synonyms').delete().eq('word_id', wordId);
  }

  // =================================================================
  //  TAG MODELS
  // =================================================================
  async findAllTags() {
    return await supabase.from('tags').select('name').order('name');
  }

  async findTagsByName(tagNames) {
    return await supabase.from('tags').select('id, name').in('name', tagNames);
  }

  async associateTagsToList(listTagRelations) {
    return await supabase.from('list_tags').insert(listTagRelations);
  }

  async disassociateAllTagsFromList(listId) {
    return await supabase.from('list_tags').delete().eq('list_id', listId);
  }

  // =================================================================
  //  RPC/DATABASE FUNCTION MODELS
  // =================================================================
  async createListWithTags(listData) {
    const { title, description, privacy_setting, creatorId, tags } = listData;
    return await supabase
      .rpc('create_list_with_tags', {
        p_title: title,
        p_description: description,
        p_privacy_setting: privacy_setting,
        p_creator_id: creatorId,
        p_tags: tags,
      })
      .select('*, tags(name)')
      .single();
  }

  async updateWordCount(listId) {
    return await supabase.rpc('update_list_word_count', { list_id_param: listId });
  }

  // Update list access to ensure it remains available after session
  async updateListAccess(listId, userId) {
    // Check if user has access to the list first
    const { data: list, error: listError } = await supabase
      .from('vocab_lists')
      .select('id, creator_id, privacy_setting')
      .eq('id', listId)
      .single();

    if (listError) throw listError;
    if (!list) throw new Error('List not found');

    // If user is creator, they always have access
    if (list.creator_id === userId) {
      return { success: true };
    }

    // For other cases, we could add logic to ensure proper access
    // This is a placeholder for more complex access control if needed
    return { success: true };
  }
}

module.exports = new VocabularyModel();
