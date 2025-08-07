const { supabase } = require('../config/supabase.config');
const crypto = require('crypto');
const { logger } = require('../utils');

class TokenBlacklistModel {
  /**
   * Hash a token for secure storage
   */
  static hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Add a token to the blacklist
   */
  static async addToBlacklist(
    token,
    tokenType,
    userId,
    expiresAt,
    reason = 'logout'
  ) {
    try {
      const tokenHash = this.hashToken(token);

      const { data, error } = await supabase
        .from('token_blacklist')
        .insert({
          token_hash: tokenHash,
          token_type: tokenType,
          user_id: userId,
          expires_at: new Date(expiresAt * 1000).toISOString(), // Convert Unix timestamp to ISO
          reason,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      // Ignore duplicate token errors (token already blacklisted)
      if (error.code === '23505') {
        return null;
      }
      throw error;
    }
  }

  /**
   * Check if a token is blacklisted
   */
  static async isBlacklisted(token) {
    try {
      const tokenHash = this.hashToken(token);

      const { data, error } = await supabase
        .from('token_blacklist')
        .select('id')
        .eq('token_hash', tokenHash)
        .single();

      if (error && error.code === 'PGRST116') {
        // No rows returned - token is not blacklisted
        return false;
      }

      if (error) throw error;

      return !!data;
    } catch (error) {
      logger.error('Error checking token blacklist:', error);
      // In case of error, fail open (allow token) to prevent service disruption
      // But log the error for monitoring
      return false;
    }
  }

  /**
   * Revoke all tokens for a user (e.g., on password change)
   */
  static async revokeAllUserTokens(userId, reason = 'password_change') {
    try {
      // We can't revoke tokens we don't have, but we can invalidate future checks
      // This would require storing all active tokens, which is not practical
      // Instead, you might want to add a "tokens_valid_after" field to the user table
      // For now, this is a placeholder

      // Alternative approach: Update user's token version in user table
      const { error } = await supabase
        .from('users')
        .update({
          token_version: supabase.raw('COALESCE(token_version, 0) + 1'),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Clean up expired tokens from blacklist
   */
  static async cleanupExpired() {
    try {
      // Try using the RPC function first
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        'cleanup_expired_blacklist_tokens'
      );

      if (!rpcError) {
        return rpcData || 0;
      }

      // Fallback: Direct deletion if RPC fails
      logger.warn('RPC cleanup failed, using direct deletion:', rpcError.message);

      const { data, error } = await supabase
        .from('token_blacklist')
        .delete()
        .lt('expires_at', new Date().toISOString())
        .select();

      if (error) throw error;
      return data ? data.length : 0;
    } catch (error) {
      logger.error('Error cleaning up expired tokens:', error);
      return 0;
    }
  }

  /**
   * Get blacklist statistics for monitoring
   */
  static async getStats() {
    try {
      // Get all reasons and count them manually since Supabase JS doesn't support GROUP BY
      const { data, error } = await supabase
        .from('token_blacklist')
        .select('reason');

      if (error) throw error;

      // Group and count manually
      const stats = {};
      if (data && data.length > 0) {
        data.forEach((item) => {
          stats[item.reason] = (stats[item.reason] || 0) + 1;
        });
      }

      // Also get total count
      const { count } = await supabase
        .from('token_blacklist')
        .select('*', { count: 'exact', head: true });

      return {
        total: count || 0,
        byReason: stats,
      };
    } catch (error) {
      logger.error('Error getting blacklist stats:', error);
      return { total: 0, byReason: {} };
    }
  }
}

module.exports = TokenBlacklistModel;
