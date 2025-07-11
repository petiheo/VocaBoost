const supabase = require('../config/database');

class VocabularyModel {
  // =================================================================
  //  LIST MODELS
  // =================================================================
  async findListById(listId) {
    return await supabase.from('vocab_lists').select('*, creator:users(id, display_name, role), tags(name)').eq('id', listId).single();
  }

  async findUserLists(userId, options) {
    const { q, privacy, sortBy, page, limit, from, to } = options;
    let query = supabase.from('vocab_lists').select('id, title, privacy_setting, word_count, updated_at, tags(name)', { count: 'exact' }).eq('creator_id', userId);

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
      let query = supabase.from('vocab_lists').select('id, title, description, word_count, updated_at, creator:users(id, display_name, role), tags(name)', { count: 'exact' }).eq('privacy_setting', 'public').eq('is_active', true);
      
      if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
      if (tags) {
          const tagArray = tags.split(',').map(t => t.trim());
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
      return await supabase.from('vocab_lists').update(updateData).eq('id', listId).select('id, title, privacy_setting, updated_at, tags(name)').single();
  }

  async deleteList(listId) {
      return await supabase.from('vocab_lists').delete().eq('id', listId);
  }

  async findListOwner(listId) {
      return await supabase.from('vocab_lists').select('creator_id').eq('id', listId).single();
  }

  // =================================================================
  //  WORD MODELS
  // =================================================================
  async createWord(wordData) {
    return await supabase.from('vocabulary').insert(wordData).select().single();
  }

  async createWordsBulk(wordsToInsert) {
      return await supabase.from('vocabulary').insert(wordsToInsert);
  }

  async findWordWithListInfo(wordId) {
      return await supabase.from('vocabulary').select('list_id, vocab_lists(creator_id, privacy_setting)').eq('id', wordId).single();
  }

  async findWordsByListId(listId, from, to) {
      return await supabase.from('vocabulary').select('id, term, definition, phonetics, image_url, created_at', { count: 'exact' }).eq('list_id', listId).order('created_at', { ascending: true }).range(from, to);
  }

  async updateWord(wordId, updateData) {
      return await supabase.from('vocabulary').update(updateData).eq('id', wordId).select('id, term, definition, image_url, updated_at').single();
  }
  
  async deleteWord(wordId) {
      return await supabase.from('vocabulary').delete().eq('id', wordId);
  }

  // =================================================================
  //  EXAMPLE MODELS
  // =================================================================
  async createExample(exampleData) {
      return await supabase.from('vocabulary_examples').insert(exampleData).select().single();
  }
  
  async findExamplesByWordId(wordId) {
      return await supabase.from('vocabulary_examples').select('*').eq('vocabulary_id', wordId).order('created_at', { ascending: true });
  }

  async findExampleWithListInfo(exampleId) {
      return await supabase.from('vocabulary_examples').select('vocabulary(vocab_lists(creator_id))').eq('id', exampleId).single();
  }

  async deleteExample(exampleId) {
      return await supabase.from('vocabulary_examples').delete().eq('id', exampleId);
  }
  
  // =================================================================
  //  SYNONYM MODELS
  // =================================================================
  async createSynonyms(synonymsToInsert) {
      return await supabase.from('word_synonyms').insert(synonymsToInsert).onConflict('word_id', 'synonym').ignore();
  }

  async findSynonymsByWordId(wordId) {
      return await supabase.from('word_synonyms').select('synonym').eq('word_id', wordId);
  }

  async deleteSynonym(wordId, synonym) {
      return await supabase.from('word_synonyms').delete().match({ word_id: wordId, synonym: synonym });
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
      return await supabase.rpc('create_list_with_tags', {
          p_title: title,
          p_description: description,
          p_privacy_setting: privacy_setting,
          p_creator_id: creatorId,
          p_tags: tags
      }).select('*, tags(name)').single();
  }
  
  async updateWordCount(listId) {
      return await supabase.rpc('update_list_word_count', { list_id_param: listId });
  }
}

module.exports = new VocabularyModel();