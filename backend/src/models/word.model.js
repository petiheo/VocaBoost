const { supabase } = require('../config/supabase.config');

class WordModel {
  static async findById(id) {
    const { data, error } = await supabase
      .from('vocabulary')
      .select()
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
}

module.exports = WordModel;
