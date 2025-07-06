const supabase = require('../config/database');

class UserModel {
  async findByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select()
      .eq('email', email)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async create(email, hashedPassword, role) {
    const { data, error } = await supabase
      .from('users')
      .insert({
        email: email,
        password_hash: hashedPassword,
        role: role,
      })
      .select();

    if (error) throw error;
    return data;
  }
}

module.exports = new UserModel();
