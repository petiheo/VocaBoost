const supabase = require('../config/database');

class UserModel {
    async findByEmail(email) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
            
        if (error && error.code !== 'PGRST116') throw error;
        console.log('UserModel sài OK!');
        return data;
    }
}

module.exports = new UserModel();