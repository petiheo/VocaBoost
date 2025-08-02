const { supabase } = require('../config/supabase.config');
const logger = require('../utils/logger');

class VocabularyModel {
  // =================================================================
  //  LIST MODELS
  // =================================================================
  async findListById(listId) {
    return await supabase
      .from('vocab_lists')
      .select('*, creator:users(id, display_name, role, avatar_url), tags(name)') // change
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
      .eq('creator_id', userId); // change

    if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
    if (privacy) query = query.eq('privacy_setting', privacy);

    if (sortBy) {
      const [field, direction] = sortBy.split(':');
      query = query.order(field, { ascending: direction === 'asc' });
    } else {
      query = query.order('updated_at', { ascending: false });
    }
    return await query.range(from, to);
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
    return await query.range(from, to);
  }

  async upsertListHistory(userId, listId) {
    return await supabase
      .from('user_list_history')
      .upsert(
        {
          user_id: userId,
          list_id: listId,
          last_accessed_at: new Date().toISOString(),
        },
        { onConflict: 'user_id, list_id' }
      );
  }

  async findHistoryLists(userId, from, to) {
    return await supabase
      .from('user_list_history')
      .select(
        `
        last_accessed_at,
        list:vocab_lists (
            listId:id,
            title,
            wordCount:word_count,
            privacy_setting,
            creator:users (id, display_name, role, avatar_url) 
        )
      `,
        { count: 'exact' } // change
      )
      .eq('user_id', userId)
      .order('last_accessed_at', { ascending: false })
      .range(from, to)
      .then(({ data, error, count }) => {
        if (data) {
          const reshapedData = data.map((item) => ({
            ...item.list,
            last_accessed_at: item.last_accessed_at,
          }));
          return { data: reshapedData, error, count };
        }
        return { data, error, count };
      });
  }

  async findPopularLists(from, to) {
    return await supabase
      .from('vocab_lists')
      .select(
        `
        listId:id,
        title,
        description,
        wordCount:word_count,
        view_count,
        creator:users (id, display_name, role, avatar_url),
        tags (name)
      `,
        { count: 'exact' } // change
      )
      .eq('privacy_setting', 'public')
      .eq('is_active', true)
      .order('view_count', { ascending: false })
      .range(from, to)
      .then(({ data, error, count }) => {
        if (data) {
          const reshapedData = data.map((item) => ({
            ...item,
            tags: item.tags.map((t) => t.name),
          }));
          return { data: reshapedData, error, count };
        }
        return { data, error, count };
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
    // ==========================================================
    // ===== NEW, MORE ROBUST VERSION ===========================
    // ==========================================================
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
      .single(); // .single() will error if no row is found, which is good for permission checks

    if (error) {
      // If the word doesn't exist, Supabase returns an error. We handle this gracefully.
      if (error.code === 'PGRST116') {
        // PostgREST code for "exact one row not found"
        return { data: null, error: null };
      }
      return { data: null, error };
    }

    // Ensure the nested vocab_lists object is not null before returning
    if (!data.vocab_lists) {
      // This is a data integrity issue (a word exists without a list),
      // but we handle it safely by treating the word as inaccessible.
      logger.error(`Data integrity issue: Word ${wordId} has no associated list.`);
      return { data: null, error: new Error('Word has no associated list.') };
    }

    return { data, error: null };
  }

  async findWordsByListId(listId, from, to) {
    // ==========================================================
    // ===== NEW, MULTI-STEP QUERY LOGIC ========================
    // ==========================================================
    try {
      // Step 1: Fetch the paginated list of basic word info.
      const {
        data: words,
        error: wordsError,
        count,
      } = await supabase
        .from('vocabulary')
        .select('*', { count: 'exact' })
        .eq('list_id', listId)
        .order('created_at', { ascending: true })
        .range(from, to);

      if (wordsError) throw wordsError;
      if (!words || words.length === 0) {
        return { data: [], error: null, count: 0 };
      }

      // Step 2: Get all the IDs of the words we just fetched.
      const wordIds = words.map((word) => word.id);

      // Step 3: Fetch all examples for those specific words in a single query.
      const { data: examples, error: examplesError } = await supabase
        .from('vocabulary_examples')
        .select('*')
        .in('vocabulary_id', wordIds);

      if (examplesError) throw examplesError;

      // Step 4: Fetch all synonyms for those specific words in a single query.
      const { data: synonyms, error: synonymsError } = await supabase
        .from('word_synonyms')
        .select('word_id, synonym')
        .in('word_id', wordIds);

      if (synonymsError) throw synonymsError;

      // Step 5: Map the examples and synonyms to their parent words for efficient lookup.
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
      logger.error(`Error in findWordsByListId for list ${listId}:`, error);
      return { data: null, error, count: 0 };
    }
  }

  async findWordsByIds(wordIds) {
    try {
      // Step 1: Fetch the full details for the provided word IDs.
      const { data: words, error: wordsError } = await supabase
        .from('vocabulary')
        .select('*')
        .in('id', wordIds);

      if (wordsError) throw wordsError;
      if (!words || words.length === 0) {
        return { data: [], error: null };
      }

      // The wordIds are already known, so we can proceed directly.

      // Step 2: Fetch all examples for those specific words.
      const { data: examples, error: examplesError } = await supabase
        .from('vocabulary_examples')
        .select('vocabulary_id, example_sentence')
        .in('vocabulary_id', wordIds);

      if (examplesError) throw examplesError;

      // Step 3: Fetch all synonyms for those specific words.
      const { data: synonyms, error: synonymsError } = await supabase
        .from('word_synonyms')
        .select('word_id, synonym')
        .in('word_id', wordIds);

      if (synonymsError) throw synonymsError;

      // Step 4: Map the examples and synonyms to their parent words.
      const examplesByWordId = new Map();
      (examples || []).forEach((ex) => {
        if (!examplesByWordId.has(ex.vocabulary_id)) {
          examplesByWordId.set(ex.vocabulary_id, []);
        }
        examplesByWordId.get(ex.vocabulary_id).push(ex);
      });

      const synonymsByWordId = new Map();
      (synonyms || []).forEach((s) => {
        if (!synonymsByWordId.has(s.word_id)) {
          synonymsByWordId.set(s.word_id, []);
        }
        synonymsByWordId.get(s.word_id).push(s.synonym);
      });

      // Step 5: Assemble the final, enriched word objects.
      const enrichedWords = words.map((word) => ({
        ...word,
        examples: examplesByWordId.get(word.id) || [],
        synonyms: synonymsByWordId.get(word.id) || [],
      }));

      return { data: enrichedWords, error: null };
    } catch (error) {
      logger.error(`Error in findWordsByIds:`, error);
      return { data: null, error };
    }
  }

  async searchInList(listId, options) {
    // ==========================================================
    // ===== NEW, MULTI-STEP QUERY LOGIC ========================
    // ==========================================================
    const { q, sortBy, from, to } = options;
    try {
      // Step 1: Fetch the paginated list of words that match the search query.
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

      const { data: words, error: wordsError, count } = await query.range(from, to);

      if (wordsError) throw wordsError;
      if (!words || words.length === 0) {
        return { data: [], error: null, count: 0 };
      }

      // Step 2: Get all the IDs of the words we just fetched.
      const wordIds = words.map((word) => word.id);

      // Step 3: Fetch all examples for those specific words in a single query.
      const { data: examples, error: examplesError } = await supabase
        .from('vocabulary_examples')
        .select('*')
        .in('vocabulary_id', wordIds);

      if (examplesError) throw examplesError;

      // Step 4: Fetch all synonyms for those specific words in a single query.
      const { data: synonyms, error: synonymsError } = await supabase
        .from('word_synonyms')
        .select('word_id, synonym')
        .in('word_id', wordIds);

      if (synonymsError) throw synonymsError;

      // Step 5: Map the examples and synonyms to their parent words for efficient lookup.
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
}

module.exports = new VocabularyModel();
