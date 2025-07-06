const supabase = require('../config/database');

class AuthToken {
  async create(token, userId, tokenType, expiresAt) {
    const { data, error } = supabase
      .from('tokens')
      .insert({
        token: token,
        user_id: userId,
        token_type: tokenType,
        expires_at: expiresAt,
      })
      .select();

    if (error) throw error;
    return data;
  }
}

module.exports = new AuthToken();
