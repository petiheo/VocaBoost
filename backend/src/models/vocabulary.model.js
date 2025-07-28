const { supabase } = require('../config/supabase.config');

class VocabularyModel {
  // =================================================================
  //  LIST MODELS
  // =================================================================
  async findListById(listId) {
    return await supabase
      .from('vocab_lists')
      .select('*, creator:users(id, display_name, role), tags(name)')
      .eq('id', listId)
      .single();
  }

  async findUserLists(userId, options) {
    const { q, privacy, sortBy, from, to } = options;
    let query = supabase
      .from('vocab_lists')
      .select(
        'id, title, privacy_setting, word_count, updated_at, tags(name), creator:users(id, display_name, role)',
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
    return await query.range(from, to);
  }

  async searchPublicLists(options) {
    const { q, tags, sortBy, from, to } = options;
    let query = supabase
      .from('vocab_lists')
      .select(
        'id, title, description, word_count, updated_at, creator:users(id, display_name, role), tags(name)',
        { count: 'exact' }
      )
      .eq('privacy_setting', 'public')
      .eq('is_active', true);

    if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
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
    return await supabase
      .from('vocabulary')
      .select('list_id, vocab_lists(creator_id, privacy_setting)')
      .eq('id', wordId)
      .single();
  }

  async findWordsByListId(listId, from, to) {
    return await supabase
      .from('vocabulary')
      .select('*, vocabulary_examples(*), word_synonyms(synonym)', { count: 'exact' })
      .eq('list_id', listId)
      .order('created_at', { ascending: true })
      .range(from, to);
  }

  async searchInList(listId, options) {
    const { q, sortBy, from, to } = options;
    let query = supabase
      .from('vocabulary')
      .select('*, vocabulary_examples(*), word_synonyms(synonym)', { count: 'exact' })
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
    return await query.range(from, to);
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
    const { data, error } = await supabase
      .from('vocabulary')
      .select('*, vocabulary_examples(*), word_synonyms(synonym)')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    // Format synonyms into a simple array
    if (data && data.word_synonyms) {
        data.synonyms = data.word_synonyms.map(s => s.synonym);
        delete data.word_synonyms;
    }
    return { data, error };
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
    return await supabase.from('vocabulary_examples').delete().eq('vocabulary_id', wordId);
  }

  // =================================================================
  //  SYNONYM MODELS
  // =================================================================
  async createSynonyms(synonymsToInsert) {
    return await supabase
      .from('word_synonyms')
      .insert(synonymsToInsert)
      .onConflict('word_id', 'synonym')
      .ignore();
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