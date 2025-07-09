const supabase = require('../config/database');

class AuthToken {
  static async create(token, userId, tokenType, expiresAt) {
    const { data, error } = await supabase
      .from('auth_tokens')
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

module.exports = AuthToken;
